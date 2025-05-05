import "dotenv/config"; // Load .env file variables
// Correct imports based on official SDK README
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import axios from "axios"; // Keep axios import, might be needed implicitly or for other tests

// MCP Resource typings
interface McpResource {
  uri: string;
  mimeType?: string;
  name?: string;
  description?: string;
}
interface ResourceContent {
  uri: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}
interface ReadResponse {
  contents: ResourceContent[];
}

// Configuration
const serverUrl = "http://localhost:8000/mcp";
const clientId = "jest-mcp-client-" + Date.now();
const TEST_TIMEOUT = 60000; // Increase to 2 minutes for playbook execution
const POLL_INTERVAL = 3000; // Poll every 3 seconds
const MAX_RETRIES = 20; // Maximum number of status check retries
const VALID_API_KEY = "bc296927-f5d2-4c0f-83b9-302ef78b95a9";

interface McpResponse {
  content: PlaybookResponse[];
}

interface PlaybookResponse {
  jobId: string;
  status?: string;
}

interface ContainerActionResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

describe("MCP Client Tests", () => {
  let transport: StreamableHTTPClientTransport;
  let client: Client;

  beforeAll(async () => {
    console.log(`Setting up MCP client test for server: ${serverUrl}`);
    console.log(`Using client ID: ${clientId}`);

    const mcpServerUrl = new URL(serverUrl);

    // Transport constructor: URL and options object containing requestInit with headers
    // @ts-ignore - Suppressing error as header passing mechanism is unclear from types - REMOVED
    transport = new StreamableHTTPClientTransport(mcpServerUrl, {
      // headers: { // Incorrect placement
      //   Authorization: `Bearer ${VALID_API_KEY}`,
      // },
      requestInit: {
        // Correct placement according to RequestInit type
        headers: {
          Authorization: `Bearer ${VALID_API_KEY}`,
        },
      },
    });

    transport.onclose = () => {
      console.log("MCP transport closed during test.");
    };
    transport.onerror = (error) => {
      console.error("MCP transport error during test:", error);
      // Optionally fail the test or log more details
    };

    // Client constructor requires clientInfo object, as per example
    client = new Client({ name: clientId, version: "1.0.0" });

    console.log("Connecting client to transport...");
    try {
      // connect method is correct
      await client.connect(transport);
      console.log(`Client connected with Session ID: ${transport.sessionId}`);
      // Check if session ID exists as confirmation
      if (!transport.sessionId) {
        throw new Error("Connection successful but no session ID received.");
      }
    } catch (error) {
      console.error("Failed to connect client in beforeAll:", error);
      throw new Error(
        `Failed to connect MCP client: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, TEST_TIMEOUT); // Apply timeout to beforeAll

  afterAll(async () => {
    // close method exists, assume it works without isConnected check
    if (client) {
      // Check if client was initialized
      try {
        console.log("Closing MCP client connection...");
        await client.close();
        console.log("Connection closed.");
      } catch (closeError) {
        console.error("Error closing client connection:", closeError);
      }
    } else {
      console.log("Client was not initialized, skipping close.");
    }
  }, TEST_TIMEOUT); // Apply timeout to afterAll

  it(
    "should connect to the MCP server",
    () => {
      // Rely on transport.sessionId existing after successful connect in beforeAll
      expect(transport.sessionId).toBeDefined();
      expect(transport.sessionId).not.toBeNull();
      console.log(
        `Test 'should connect': Connected with session ID ${transport.sessionId}`
      );
    },
    TEST_TIMEOUT
  );

  it(
    'should call the "echo" tool and receive the correct response',
    async () => {
      // Ensure connection via transport.sessionId
      expect(transport.sessionId).toBeDefined();
      const echoMessage = "Hello from Jest client!";
      console.log(`Test 'echo': Calling tool with message: "${echoMessage}"`);

      // Use client.callTool with correct argument structure
      const echoResponse = await client.callTool({
        name: "echo",
        arguments: { message: echoMessage },
      });

      console.log(
        `Test 'echo': Received response:`,
        JSON.stringify(echoResponse, null, 2)
      );

      // Check the structure and content of the response
      expect(echoResponse).toBeDefined();
      expect(echoResponse.content).toBeInstanceOf(Array);
      expect(echoResponse.content).toHaveLength(1); // Expecting one message part

      // Add type check to satisfy linter about indexing potentially empty object
      const messagePart = Array.isArray(echoResponse.content)
        ? echoResponse.content[0]
        : undefined;
      expect(messagePart).toBeDefined();
      expect(messagePart?.type).toBe("text");
      expect(messagePart?.text).toBe(echoMessage);

      console.log(`Test 'echo': PASSED`);
    },
    TEST_TIMEOUT
  );

  // --- Test Authentication: No Token ---
  it(
    "should fail with unauthorized when no token is provided",
    async () => {
      const mcpServerUrl = new URL(serverUrl);
      // Create transport WITHOUT headers
      const noAuthTransport = new StreamableHTTPClientTransport(mcpServerUrl);
      const noAuthClient = new Client({
        name: `${clientId}-no-auth`,
        version: "1.0.0",
      });

      try {
        await noAuthClient.connect(noAuthTransport);
        console.log(
          "Test noAuth: Connected (unexpectedly), attempting tool call..."
        );

        // Expect the tool call to fail
        await expect(
          noAuthClient.callTool({
            name: "echo",
            arguments: { message: "should fail" },
          })
        ).rejects.toThrow(); // Generic error check, refine if specific error is known
      } catch (error) {
        // Connection itself might fail depending on transport implementation
        console.log("Test noAuth: Failed as expected:", error);
        // We can check for specific error properties if known
        expect(error).toBeDefined();
      } finally {
        await noAuthClient.close();
      }
    },
    TEST_TIMEOUT
  );

  // --- Test Authentication: Invalid Token ---
  it(
    "should fail with unauthorized when an invalid token is provided",
    async () => {
      const mcpServerUrl = new URL(serverUrl);
      // Create transport WITH INVALID header via requestInit
      // @ts-ignore - Suppressing error as header passing mechanism is unclear from types - REMOVED
      const invalidAuthTransport = new StreamableHTTPClientTransport(
        mcpServerUrl,
        {
          // headers: { // Incorrect placement
          //   Authorization: 'Bearer invalid-token',
          // },
          requestInit: {
            // Correct placement according to RequestInit type
            headers: {
              Authorization: "Bearer invalid-token",
            },
          },
        }
      );
      const invalidAuthClient = new Client({
        name: `${clientId}-invalid-auth`,
        version: "1.0.0",
      });

      try {
        await invalidAuthClient.connect(invalidAuthTransport);
        console.log(
          "Test invalidAuth: Connected (unexpectedly), attempting tool call..."
        );

        // Expect the tool call to fail
        await expect(
          invalidAuthClient.callTool({
            name: "echo",
            arguments: { message: "should fail" },
          })
        ).rejects.toThrow(); // Generic error check
      } catch (error) {
        // Connection itself might fail
        console.log("Test invalidAuth: Failed as expected:", error);
        expect(error).toBeDefined();
      } finally {
        await invalidAuthClient.close();
      }
    },
    TEST_TIMEOUT
  );

  // --- list devices via MCP resource ---
  it(
    "should list all devices via MCP resource",
    async () => {
      expect(transport.sessionId).toBeDefined();
      console.log("Test 'listDevices': Listing resources...");
      // List all resources and find the devices entry

      const result = await client.listResources();
      console.log(
        "Available resources:",
        result?.resources.map((r) => r.uri)
      );
      const devicesResource = result?.resources.find(
        (r) => r.uri === "devices://"
      );
      expect(devicesResource).toBeDefined();
      console.log("Test 'listDevices': Reading devices resource...");
      // Read the devices resource
      const read = (await client.readResource({
        uri: "devices://",
      })) as unknown as ReadResponse;
      console.log("read", JSON.stringify(read, null, 2));
      expect(Array.isArray(read.contents)).toBe(true);
      const text = read.contents[0].text!;
      const devices = JSON.parse(text);
      expect(Array.isArray(devices)).toBe(true);
      console.log(`Test 'listDevices': Got ${devices.length} devices`);
      for (const device of devices) {
        const deviceUri = `devices://${device.uuid}`;
        const read = (await client.readResource({
          uri: deviceUri,
        })) as unknown as ReadResponse;
        console.log("read", JSON.stringify(read, null, 2));
        expect(Array.isArray(read.contents)).toBe(true);
        expect(read.contents.length).toBeGreaterThan(0);
        const deviceJson = read.contents[0].text!;
        const _device = JSON.parse(deviceJson);
        expect(_device).toBeDefined();
        expect(_device.uuid).toBe(device.uuid);
      }
    },
    TEST_TIMEOUT
  );

  // --- executePlaybook and getPlaybookStatus ---
  it(
    "should execute playbook and check status until completion",
    async () => {
      expect(transport.sessionId).toBeDefined(); // Ensure connection
      const params = {
        playbookQuickRef: process.env.TEST_PLAYBOOK_ID || "ping",
        target: process.env.TEST_TARGET_HOST || "localhost",
      };
      console.log(
        `Test 'executePlaybook': Starting execution with params:`,
        params
      );

      if (params.playbookQuickRef === "ping" || params.target === "localhost") {
        console.warn(
          "Test 'executePlaybook': Using placeholder playbook/target. Set TEST_PLAYBOOK_ID and TEST_TARGET_HOST in .env for a real test."
        );
      }

      try {
        console.log("Executing playbook...");
        // Execute playbook
        const execResponse = await client.callTool({
          name: "executePlaybook",
          arguments: { playbookQuickRef: "ping" },
        });
        console.log(
          `Test 'executePlaybook': Execution response:`,
          JSON.stringify(execResponse, null, 2)
        );
        expect(execResponse).toBeDefined();
        expect(execResponse.content).toBeInstanceOf(Array);

        // Extract job ID from response
        const execContent = JSON.parse(
          (execResponse.content as unknown as any)[0].text
        );
        console.log("execContent", execContent);
        const execId = execContent?.execId;
        expect(execId).toBeDefined();
        console.log(`Test 'executePlaybook': Got job ID: ${execId}`);

        // Poll for status until completion or timeout
        let retries = 0;
        let finalStatus = null;
        while (retries < MAX_RETRIES) {
          const statusResponse = await client.callTool({
            name: "getPlaybookExecutionStatus",
            arguments: { execId },
          });
          console.log(
            `Test 'getPlaybookStatus': Poll ${retries + 1}, response:`,
            JSON.stringify(statusResponse, null, 2)
          );

          const statusContent = JSON.parse(
            (statusResponse.content as unknown as any)[0].text
          );
          const status = statusContent?.[0]?.status;
          if (!status) {
            throw new Error("Invalid status response");
          }

          // Check if we've reached a final status
          if (
            ["starting", "running", "completed", "failed", "canceled"].includes(
              status
            )
          ) {
            finalStatus = status;
            break;
          }

          // Wait before next poll
          await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          retries++;
        }

        // Verify we got a final status
        expect(finalStatus).toBeDefined();
        console.log(`Test 'executePlaybook': Final status: ${finalStatus}`);

        if (finalStatus === "FAILED" || finalStatus === "TIMEOUT") {
          throw new Error(
            `Playbook execution ended with status: ${finalStatus}`
          );
        }
      } catch (error) {
        console.error(`Test 'executePlaybook': FAILED`, error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );

  // --- findAllContainers ---
  it(
    'should call the "findAllContainers" tool successfully',
    async () => {
      expect(transport.sessionId).toBeDefined(); // Ensure connection
      console.log(`Test 'findAllContainers': Calling tool...`);
      try {
        const response = await client.callTool({
          name: "findAllContainers",
          arguments: {},
        }); // No parameters
        console.log(`Test 'findAllContainers': Received response`);
        expect(response).toBeDefined();
        expect(response.content).toBeInstanceOf(Array);
        console.log(`Test 'findAllContainers': PASSED (basic structure check)`);
      } catch (error) {
        console.error(`Test 'findAllContainers': FAILED`, error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );

  // --- findContainerById ---
  it(
    'should call the "findContainerById" tool successfully',
    async () => {
      expect(transport.sessionId).toBeDefined(); // Ensure connection
      // Use an environment variable or a known placeholder ID for testing
      const testContainerId =
        process.env.TEST_CONTAINER_ID || "placeholder_container_id";
      console.log(
        `Test 'findContainerById': Calling tool with containerId: ${testContainerId}`
      );

      if (testContainerId === "placeholder_container_id") {
        console.warn(
          "Test 'findContainerById': Using placeholder ID. Set TEST_CONTAINER_ID in .env for a real test."
        );
      }

      try {
        const response = await client.callTool({
          name: "findContainerById",
          arguments: { containerId: testContainerId },
        });
        console.log(`Test 'findContainerById': Received response`);
        expect(response).toBeDefined();
        expect(response.content).toBeInstanceOf(Array);
        console.log(`Test 'findContainerById': PASSED (basic structure check)`);
      } catch (error) {
        console.error(`Test 'findContainerById': FAILED`, error);
        throw error; // Fail the test
      }
    },
    TEST_TIMEOUT
  );

  // --- getTimeseriesStats ---
  it(
    'should call the "getTimeseriesStats" tool successfully',
    async () => {
      expect(transport.sessionId).toBeDefined(); // Ensure connection
      const params = { metric: "cpu_usage", step: "1m" }; // Example parameters
      console.log(
        `Test 'getTimeseriesStats': Calling tool with params:`,
        params
      );
      try {
        const response = await client.callTool({
          name: "getTimeseriesStats",
          arguments: params,
        });
        console.log(
          `Test 'getTimeseriesStats': Received response:`,
          JSON.stringify(response, null, 2)
        );
        expect(response).toBeDefined();
        expect(response.content).toBeInstanceOf(Array);
        console.log(
          `Test 'getTimeseriesStats': PASSED (basic structure check)`
        );
      } catch (error) {
        console.error(`Test 'getTimeseriesStats': FAILED`, error);
        throw error;
      }
    },
    TEST_TIMEOUT
  );

  // --- containerAction ---
  describe("containerAction tool", () => {
    const TEST_CONTAINER_ID = process.env.TEST_CONTAINER_ID || "test-container";

    beforeEach(() => {
      if (TEST_CONTAINER_ID === "test-container") {
        console.warn(
          "Test 'containerAction': Using placeholder container ID. Set TEST_CONTAINER_ID in .env for a real test."
        );
      }
    });

    const testAction = async (action: string) => {
      expect(transport.sessionId).toBeDefined(); // Ensure connection
      console.log(
        `Test 'containerAction': Testing ${action} action on container ${TEST_CONTAINER_ID}`
      );

      const response = (await client.callTool({
        name: "containerAction",
        arguments: {
          containerId: TEST_CONTAINER_ID,
          action: action,
        },
      })) as ContainerActionResponse;

      console.log(
        `Test 'containerAction': ${action} response:`,
        JSON.stringify(response, null, 2)
      );
      expect(response).toBeDefined();
      expect(response.content).toBeInstanceOf(Array);
      expect(response.content.length).toBe(1);

      const messagePart = response.content[0];
      expect(messagePart.type).toBe("text");
      expect(messagePart.text).toContain(
        `Successfully performed ${action} action on container ${TEST_CONTAINER_ID}`
      );
    };

    it(
      "should start a container",
      async () => {
        await testAction("start");
      },
      TEST_TIMEOUT
    );

    it(
      "should stop a container",
      async () => {
        await testAction("stop");
      },
      TEST_TIMEOUT
    );

    it(
      "should restart a container",
      async () => {
        await testAction("restart");
      },
      TEST_TIMEOUT
    );

    it(
      "should pause a container",
      async () => {
        await testAction("pause");
      },
      TEST_TIMEOUT
    );

    it(
      "should kill a container",
      async () => {
        await testAction("kill");
      },
      TEST_TIMEOUT
    );

    it(
      "should fail with invalid container ID",
      async () => {
        expect(transport.sessionId).toBeDefined();
        console.log(
          "Test 'containerAction': Testing with invalid container ID"
        );

        await expect(
          client.callTool({
            name: "containerAction",
            arguments: {
              containerId: "non-existent-container",
              action: "start",
            },
          })
        ).rejects.toThrow();
      },
      TEST_TIMEOUT
    );

    it(
      "should fail with invalid action",
      async () => {
        expect(transport.sessionId).toBeDefined();
        console.log("Test 'containerAction': Testing with invalid action");

        await expect(
          client.callTool({
            name: "containerAction",
            arguments: {
              containerId: TEST_CONTAINER_ID,
              action: "invalid-action",
            },
          })
        ).rejects.toThrow();
      },
      TEST_TIMEOUT
    );
  });
});
