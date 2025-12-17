import { MultiServerMCPClient } from "@langchain/mcp-adapters";

const leetCodeMCP = new MultiServerMCPClient({
  mcpServers: {
    leetcode: {
      type: "stdio",
      command: "npx",
      args: ["-y", "@jinzcdev/leetcode-mcp-server"],
      // env: {
      //   LEETCODE_SITE: "cn",
      //   LEETCODE_SESSION: "<您的 LEETCODE 会话 COOKIE>",
      // },
    },
  },
});

// export default leetCodeMCP;
export default {}