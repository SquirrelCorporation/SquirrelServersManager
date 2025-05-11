# Plan: Implementing Linked Authentication (OIDC/LDAP) via Identity Linking

**Model Focus:** This plan details the implementation of an **Identity Linking Model**. It allows the single, pre-existing administrator user to link their account to external OIDC or LDAP providers for alternative login methods. It does **NOT** cover automatic user creation or onboarding of *new* users via these external providers.

This document outlines the plan to add support for the primary administrator user to link their account to external OpenID Connect (OIDC) or LDAP providers and subsequently log in using those linked methods alongside their local password.

**Key Change:** OIDC and LDAP provider configurations will be stored securely in a dedicated MongoDB collection using a nested structure for type-specific settings. Sensitive fields (Client Secrets, Bind Passwords) within this structure will be encrypted using VaultService.

## 1. Rationale & Goals

**Problem:** Current setup is local-password only for a single administrator. Need to allow this *specific user* to leverage external OIDC/LDAP for login convenience/policy enforcement.
**Goal:** Allow the existing admin user to link OIDC/LDAP accounts in settings and use them as alternative login methods. Store provider configuration securely in the database, encrypted via Vault, using a clean nested structure.
**Model:** **Identity Linking** for the existing admin user. This is *not* about adding multi-user support at this stage.

## 2. Core Strategy (DB Config - Identity Linking Model)

*   **Initial State:** One local admin user exists (created manually).
*   **Provider Config Storage:** Create `AuthProviderConfig` entity/collection (nested settings, DB stored).
*   **Encryption:** Use `VaultService` for secrets in `AuthProviderConfig`.
*   **Admin UI for Config:** Manage global OIDC/LDAP provider settings.
*   **User Linking (Admin Only):** User Settings UI allows the *logged-in admin* to initiate OIDC/LDAP linking.
*   **User Entity:** Modify the *existing user record* to store optional OIDC (`oidcSub`, `oidcIssuer`) and LDAP (`ldapDn`) linking identifiers.
*   **Passport Strategies:** Use `passport-openidconnect`, `passport-ldapauth`.
*   **Asynchronous Factories:** Required for strategies to load DB config.
*   **Authentication Logic:** Strategy `validate` methods **find the existing admin user** based on linked identifiers (`oidcSub`/`ldapDn`). **No user creation logic** in strategies.
*   **Backend Routes:** Login/callback routes + specific **linking routes** initiated by the logged-in admin.
*   **JWT:** Continue using JWT.

## 3. Detailed Implementation Steps (Checklist)

### Phase 1: Backend - DB Schema, Services & Configuration UI

- [ ] **Install Dependencies:**
    - [ ] Ensure `@nestjs/passport`, `passport`, `@types/passport`.
    - [ ] Install `passport-openidconnect`.
    - [ ] Install `passport-ldapauth`, `@types/passport-ldapauth`.
    - [ ] Ensure `VaultService`, `@nestjs/mongoose`, `mongoose` are correctly set up.
- [ ] **Define `AuthProviderConfig` Entity/Schema & Model:**
    - [ ] `auth-provider-config.schema.ts`:
        ```typescript
        // Define interfaces/classes for nested settings
        class OidcSettings { /* fields... */ }
        class LdapSettings { /* fields... */ }

        @Schema({ timestamps: true })
        export class AuthProviderConfig {
          @Prop({ required: true, enum: ['oidc', 'ldap'], index: true })
          type: string;

          @Prop({ required: true })
          name: string;

          @Prop({ default: false, index: true })
          isEnabled: boolean;

          // Store type-specific settings in a nested object
          @Prop({ type: Object, required: true })
          settings: {
            oidc?: OidcSettings;
            ldap?: LdapSettings;
          };
        }

        export const AuthProviderConfigSchema = SchemaFactory.createForClass(AuthProviderConfig);
        ```
    - [ ] Define the `OidcSettings` and `LdapSettings` structures containing the relevant fields (`issuerUrl`, `clientId`, `clientSecretEncrypted`, `scopes`, etc. for OIDC; `url`, `bindDnEncrypted`, `bindPasswordEncrypted`, `searchBase`, `searchFilter` for LDAP).
- [ ] **Create `AuthProviderConfigRepository`:** (Interface and Mongoose implementation based on the new schema).
- [ ] **Create `AuthProviderConfigService`:**
    *   [ ] Inject Repository and `VaultService`.
    *   [ ] Implement `create(configDto)`: Determine `type` from DTO, construct the correct nested `settings` object, **encrypt sensitive fields within `settings`** using `VaultService`, call repository `create`.
    *   [ ] Implement `findAll()`: Fetch all, then iterate and **decrypt secrets within the nested `settings`** object for display (or return without decrypted secrets).
    *   [ ] Implement `findEnabledByType(type: 'oidc' | 'ldap')`: Find enabled by type, **decrypt secrets within the nested `settings`**.
    *   [ ] Implement `findOne(id)`: Find by ID, **decrypt secrets within `settings`**.
    *   [ ] Implement `update(id, updateDto)`: Fetch existing, merge changes, handle potential re-encryption of secrets in `settings`, call repository `update`.
    *   [ ] Implement `delete(id)`.
    *   [ ] Refine helper methods for decryption based on nested structure.
- [ ] **Create `AuthProviderConfigModule`:** Provide Repository, Service. Import `MongooseModule.forFeature`, `VaultModule`.
- [ ] **Integrate into Admin Controller:**
    *   [ ] Protect with Admin role guard.
    *   [ ] Inject `AuthProviderConfigService`.
    *   [ ] Adapt CRUD endpoints (`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`) to work with the service and nested DTO structure.
    *   [ ] Create corresponding DTOs reflecting the nested structure (`CreateOidcProviderDto`, `CreateLdapProviderDto`, `UpdateOidcProviderDto`, etc., potentially using discriminated unions based on `type`). Ensure validation is correctly applied to nested fields.

### Phase 2: Backend - User Module Evolution (Linking Info for Admin)

- [ ] **Modify `User` Entity/Schema (`user.entity.ts`):**
    *   [ ] Verify `password` field exists (for the admin's local login).
    *   [ ] Add `oidcSub: string` (optional, indexed).
    *   [ ] Add `oidcIssuer: string` (optional).
    *   [ ] Add `ldapDn: string` (optional, indexed).
    *   [ ] Verify/add `displayName`, `avatarUrl` (optional, can be updated during linking).
- [ ] **Modify `UsersService` (`users.service.ts`):**
    *   [ ] **Remove any `findOrCreateByProvider` logic.**
    *   [ ] Implement `linkOidcIdentity(userId, oidcSub, oidcIssuer, profileData?)`: Updates the *specific user* record.
    *   [ ] Implement `linkLdapIdentity(userId, ldapDn)`: Updates the *specific user* record.
    *   [ ] Implement `findUserByOidcIdentity(oidcSub, oidcIssuer)`: Finds the *single user* based on linked OIDC ID.
    *   [ ] Implement `findUserByLdapDn(ldapDn)`: Finds the *single user* based on linked LDAP DN.
    *   [ ] Verify `validateUserCredentials` (for admin's local login).
    *   [ ] Implement unlinking logic (optional).

### Phase 3: Backend - Asynchronous Strategy Factories & AuthModule

- [ ] **Create OIDC Strategy Factory Provider:**
    ```typescript
    {
      provide: OidcStrategy,
      useFactory: async (configService: AuthProviderConfigService, usersService: UsersService) => {
        const oidcConfigContainer = await configService.findEnabledByType('oidc');
        if (!oidcConfigContainer || !oidcConfigContainer.settings.oidc) {
           return new DisabledStrategy();
        }
        // Pass the nested, decrypted OIDC settings object
        return new OidcStrategy(oidcConfigContainer.settings.oidc, usersService);
      },
      inject: [AuthProviderConfigService, UsersService],
    }
    ```
- [ ] **Modify `OidcStrategy` (`oidc.strategy.ts`):**
    *   [ ] Constructor accepts decrypted OIDC settings.
    *   [ ] `validate` method calls `usersService.findUserByOidcIdentity`. **Crucially, fails validation if no user is found** (as we are not creating users here).
        ```typescript
        async validate(issuer, profile, done) {
          const user = await this.usersService.findUserByOidcIdentity(profile.id, issuer);
          if (!user) {
            // OIDC identity exists but is not linked to the SSM admin user
            return done(null, false, { message: 'OIDC account not linked.' });
          }
          return done(null, user); // Return the found admin user
        }
        ```
- [ ] **Create LDAP Strategy Factory Provider:**
    ```typescript
    {
      provide: LdapStrategy,
      useFactory: async (configService: AuthProviderConfigService, usersService: UsersService) => {
        const ldapConfigContainer = await configService.findEnabledByType('ldap');
        if (!ldapConfigContainer || !ldapConfigContainer.settings.ldap) {
           return new DisabledStrategy();
        }
        // Pass the nested, decrypted LDAP settings object
        return new LdapStrategy(ldapConfigContainer.settings.ldap, usersService);
      },
      inject: [AuthProviderConfigService, UsersService],
    }
    ```
- [ ] **Modify `LdapStrategy` (`ldap.strategy.ts`):**
    *   [ ] Constructor accepts decrypted LDAP settings.
    *   [ ] `validate` method calls `usersService.findUserByLdapDn`. **Crucially, fails validation if no user is found.**
        ```typescript
        async validate(ldapUser, done) {
          const user = await this.usersService.findUserByLdapDn(ldapUser.dn);
          if (!user) {
             // LDAP user authenticated but DN not linked to the SSM admin user
            return done(null, false, { message: 'LDAP account not linked.' });
          }
          return done(null, user); // Return the found admin user
        }
        ```
- [ ] **Update `AuthModule` (`auth.module.ts`):**
    *   [ ] Import `AuthProviderConfigModule`.
    *   [ ] Remove direct strategy providers.
    *   [ ] Add the asynchronous factory providers.
    *   [ ] Keep other necessary imports/providers.

### Phase 4: Backend - Linking & Login Logic (Controllers)

- [ ] **Modify `AuthController` (`auth.controller.ts`):**
    *   [ ] Keep login routes (`/auth/login`, `/auth/oidc`, `/auth/ldap`).
    *   [ ] Keep OIDC callback (`/auth/oidc/callback`).
    *   [ ] Keep `handleProviderCallback`.
    *   [ ] Add `GET /api/auth/providers`: Inject `AuthProviderConfigService`, call `findEnabledByType` for OIDC/LDAP, return enabled types/names.
- [ ] **Modify `AccountSettingsController` (or similar):**
    *   [ ] Keep OIDC/LDAP linking initiation routes.
    *   [ ] Keep OIDC/LDAP linking callback/handler routes (LDAP handler verifies against *decrypted* config fetched from `AuthProviderConfigService`).
    *   [ ] Keep linking status route (`/users/me/auth-links`).
    *   [ ] Keep unlinking routes (optional).

### Phase 5: Frontend - Admin UI for Provider Configuration

- [ ] **Create/Modify Admin Settings Page (`Admin/Settings/AuthProviderConfig`):**
    *   [ ] Fetch current provider configs.
    *   [ ] UI needs to adapt based on `type` to show correct fields for OIDC or LDAP within the `settings` object.
    *   [ ] On save/create, submit DTO reflecting the nested structure (with plaintext secrets).
    *   [ ] Handle Edit/Delete.
    *   [ ] Add note about potential server restart needed.

### Phase 6: Frontend - User (Admin) UI for Linking

- [ ] **Create/Modify User Settings Page (`Settings/Authentication`):**
    *   [ ] Fetch linking status.
    *   [ ] Display status.
    *   [ ] Conditionally show Link buttons based on global enabled status (from `/api/auth/providers`).
    *   [ ] Handle linking initiation/submission.
    *   [ ] Handle Unlink buttons (optional).

### Phase 7: Frontend - Login Page Update

- [ ] **Login Page (`Login/index.tsx`):**
    *   [ ] Fetch enabled provider types (`GET /api/auth/providers`).
    *   [ ] Always show local form.
    *   [ ] Conditionally show OIDC/LDAP buttons/forms.

### Phase 8: Testing & Refinement

- [ ] **DB & Encryption:** Test provider config CRUD.
- [ ] **Async Factories:** Test strategy initialization.
- [ ] **Admin Config UI:** Test saving global configs.
- [ ] **Linking Flow:** Test *admin user* successfully linking OIDC/LDAP.
- [ ] **Login Flows:** Test admin login via Local, linked OIDC, linked LDAP. **Verify login *fails* if using OIDC/LDAP before linking.**
- [ ] **Security Review:** Vault key security, DB access, permissions, CSRF, cookie security.

## 4. Open Questions & Decisions (Revisit)

- [ ] **Decision:** Exact Mongoose schema for `AuthProviderConfig`.
- [ ] **Decision:** Handling multiple enabled providers (UI/logic to choose which one to link?).
- [ ] **Decision:** Implement unlinking?
- [ ] **Decision:** Restart mechanism/notification.
- [ ] **Confirmation:** JWT remains.

## 5. Security Warning 🚨

*   This approach stores sensitive **OAuth Client Secrets and potentially LDAP Bind Passwords in PLAINTEXT** within the `/data/.env.auth` file.
*   **Strict file system permissions** (readable/writable *only* by the application user) are **absolutely critical** to mitigate risk.
*   Ensure the server process running the application does not have excessive privileges.
*   Unauthorized access to this file compromises external provider integrations.
*   Consider the security implications carefully before proceeding with this method.
