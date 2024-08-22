import express from "express";
import collectionDetail from "../data/collection-detail.json";
import collection from "../data/collection.json";
import execLogs from "../data/exec-logs.json";
import execStatuses from "../data/exec-statuses.json";
import playbooksRepoGit from "../data/playbooks-repo-git.json";
import playbooksRepoLocal from "../data/playbooks-repo-local.json";
import playbooksRepo from "../data/playbooks-repository.json";
import playbooks from "../data/playbooks.json";
import { SuccessResponse } from "../utils/ApiResponse";
import asyncHandler from "../utils/AsyncHandler";

const router = express.Router();

router.get(
  "/playbooks",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got playbooks", playbooks).send(res);
  }),
);

router.post(
  "/playbooks/exec/quick-ref/:name",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Exec playbook quick ref", {
      execId: "132030b2-9a12-48c4-8182-aad1cb7179aa",
    }).send(res);
  }),
);

router.post(
  "/playbooks/exec/:name",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Exec playbook quick ref", {
      execId: "132030b2-9a12-48c4-8182-aad1cb7179aa",
    }).send(res);
  }),
);

router.get(
  "/playbooks/exec/:id/status",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Get exec status", execStatuses).send(res);
  }),
);

router.get(
  "/playbooks/exec/:id/logs",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Get exec logs", execLogs).send(res);
  }),
);

router.route("/playbooks/galaxy/collection").get(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got collection", collection).send(res);
  }),
);

router.route("/playbooks/galaxy/collection/details").get(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got collection details", collectionDetail).send(res);
  }),
);

router.route("/playbooks/galaxy/collection/install").post(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Post collection install").send(res);
  }),
);

router.route("/playbooks/extravars/:id").post(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Posted extravar").send(res);
  }),
);

router.route("/playbooks/:uuid/extravars").post(
  asyncHandler(async (req, res) => {
    new SuccessResponse("Posted extravar").send(res);
  }),
);

router
  .route("/playbooks/:uuid")
  .get(
    asyncHandler(async (req, res) => {
      new SuccessResponse(
        "Got playbook",
        "---\n" +
          "- name: Update web servers\n" +
          "  hosts: webservers\n" +
          "  remote_user: root\n" +
          "\n" +
          "  tasks:\n" +
          "  - name: Ensure apache is at the latest version\n" +
          "    ansible.builtin.yum:\n" +
          "      name: httpd\n" +
          "      state: latest\n" +
          "\n" +
          "  - name: Write the apache config file\n" +
          "    ansible.builtin.template:\n" +
          "      src: /srv/httpd.j2\n" +
          "      dest: /etc/httpd.conf\n" +
          "\n" +
          "- name: Update db servers\n" +
          "  hosts: databases\n" +
          "  remote_user: root\n" +
          "\n" +
          "  tasks:\n" +
          "  - name: Ensure postgresql is at the latest version\n" +
          "    ansible.builtin.yum:\n" +
          "      name: postgresql\n" +
          "      state: latest\n" +
          "\n" +
          "  - name: Ensure that postgresql is started\n" +
          "    ansible.builtin.service:\n" +
          "      name: postgresql\n" +
          "      state: started",
      ).send(res);
    }),
  )
  .patch(
    asyncHandler(async (req, res) => {
      new SuccessResponse("Patched playbook").send(res);
    }),
  )
  .delete(
    asyncHandler(async (req, res) => {
      new SuccessResponse("Patched playbook").send(res);
    }),
  );

router.get(
  "/playbooks-repository",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got playbooks repo", playbooksRepo).send(res);
  }),
);

router.get(
  "/playbooks-repository/local/",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got playbooks repo local", playbooksRepoLocal).send(
      res,
    );
  }),
);

router.get(
  "/playbooks-repository/git/",
  asyncHandler(async (req, res) => {
    new SuccessResponse("Got playbooks repo git", playbooksRepoGit).send(res);
  }),
);

export default router;
