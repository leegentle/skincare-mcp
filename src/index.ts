import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import FormData from "form-data";
import { AlertFeature } from "./type.js";
import fetch from "node-fetch";
import { Readable } from "stream";

const API_BASE = "http://localhost:2580";

// Create server instance
const server = new McpServer({
  name: "skincare",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "get-selfie-analysis",
  "이미지URL을 받아 분석 결과를 반환합니다.",
  {
    imageUrl: z.string().describe("분석할 이미지의 URL"),
  },
  async ({ imageUrl }) => {
    try {
      const result = await sendImageFromUrl(imageUrl);
      const response = await axios.post("http://localhost:2580/echo", {
        imageUrl,
      });

      const RESULT = "피부좋음";

      return {
        content: [
          {
            type: "text",
            text: RESULT,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `이미지 분석 요청 실패: ${error}`,
          },
        ],
      };
    }
  }
);

async function sendImageFromUrl(imageUrl: string) {
  // 1. 이미지 다운로드
  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) throw new Error("이미지 다운로드 실패");

  // 2. FormData 생성 및 파일 첨부
  const form = new FormData();
  // stream으로 변환해서 form에 append
  form.append("file", imageResponse.body as Readable, {
    filename: "image.jpg", // 적절한 파일명 지정
    contentType: imageResponse.headers.get("content-type") || "image/jpeg",
  });

  // 3. 원하는 API로 전송
  const response = await fetch("http://localhost:2580/echo", {
    method: "POST",
    body: form,
  });

  const result = await response.json();
  return result;
}

const main = async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
};

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
