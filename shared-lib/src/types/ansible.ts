export type Data = {
  repository: {
    pulp_href: string;
    pulp_created: string;
    versions_href: string;
    pulp_labels: {
      [key: string]: string;
    };
    latest_version_href: string;
    name: string;
    description: string;
    retain_repo_versions: number;
    remote: string;
  };
  collection_version: {
    pulp_href: string;
    namespace: string;
    name: string;
    version: string;
    requires_ansible: string;
    pulp_created: string;
    contents: {
      name: string;
      description: string;
      content_type: string;
    }[];
    dependencies: {};
    description?: string;
    tags: {
      name: string;
    }[];
  };
  repository_version: string;
  namespace_metadata: {
    pulp_href: string;
    name: string;
    company: string;
    description: string;
    avatar_url: string;
  };
  is_highest: boolean;
  is_deprecated: boolean;
  is_signed: boolean;
};

export type Links = {
  first: string;
  previous?: null | string;
  next: string;
  last: string;
};

export type JsonResponse = {
  meta: {
    count: number;
  };
  links: Links;
  data: Data[];
};
