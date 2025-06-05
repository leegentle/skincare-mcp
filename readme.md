# Skincare-MCP

## Overview

Skincare-MCP is a Model Context Protocol (MCP) server that provides AI-based skin analysis based on a selfie image URL. It accepts a URL pointing to a user-provided selfie, analyzes the image through two stages of processing, and returns comprehensive skin status, management recommendations, and therapy guidance. The server can be integrated with any MCP-compatible client—such as Claude Desktop App, Continue, Cline, and others—to enable real-time skincare diagnostics and personalized advice.

## Features

- Analyze basic skin status from a selfie (e.g., care-needed regions, estimated skin age, skin point score).
- Determine detailed skin type attributes (Dry, Oily, Pigmented, etc.) and generate a type code.
- Recommend tailored management methods (e.g., hydration routines, pore tightening toners).
- Provide detailed skin context and quantitative point scores for Pigmented, Pores, Redness, Sebum, Trouble, Wrinkle.
- Offer therapy guidance, including advantages, cautions, detailed procedure, and expected effect.
- Return a “recommend therapy” field (e.g., “Aqua Peeling”) based on the user’s skin profile.

## How It Works

Poke-MCP is built using the Model Context Protocol, which enables AI applications to access external tools and data sources in a standardized way. The server:

1. Connects to the skincareAPI to fetch skincare data
2. Exposes several tools through the MCP interface
3. Processes requests from MCP clients
4. Returns formatted skincare information

## MCP Tools

The Skincare-MCP server exposes the following primary tool:

- **get-skin-analysis**:

  - **Description**: Given a selfie image URL, returns a JSON object containing all available skin analysis fields (both basic status and detailed management/therapy information).
  - **Input Parameters**:

    - `image_url` (string): Publicly accessible URL of the user’s selfie image.

  - **Output**: JSON containing fields (listed in “Provided Fields” below).

## Provided Fields

The server returns all of the following fields (no separate “analysis_1” vs. “analysis_2” nesting is exposed to the client; they’re merged in output).

1. **need_therapy**

   - Array of face regions requiring care or therapy (e.g., `["right cheek", "jaw"]`).

2. **skin_age**

   - Integer representing the estimated skin age.

3. **skin_point**

   - `max_score` (number): Maximum possible score (e.g., 10).
   - `current_score` (number): User’s current skin point score.

4. **skin_type** (boolean flags)

   - `Dry`
   - `Non_Pigmented`
   - `Oily`
   - `Pigmented`
   - `Resistant`
   - `Sensitive`
   - `Tight`
   - `Wrinkle`

5. **skin_type_analysis.type_code**

   - A string code representing the combination of True/False flags (e.g., “OSRT”).

6. **manage_methods.recommend_methods**

   - Array of strings suggesting skin management routines (e.g., hydration, pore-tightening toner, double cleansing at night, sebum-controlling cleanser, weekly sebum care pack).

7. **skin_detail_analysis.skin_detail_context**

   - Array of descriptive keywords summarizing detailed skin condition (e.g., `["elastic skin texture", "oil and pore management needed"]`).

8. **skin_detail_analysis.skin_detail_points**

   - `Pigmented` (number)
   - `Pores` (number)
   - `Redness` (number)
   - `Sebum` (number)
   - `Trouble` (number)
   - `Wrinkle` (number)
   - `max_score` (number)

9. **therapy.all_datas**

   - `advantage` (string): Description of therapy’s main advantages.
   - `caution` (array of strings): List of post-treatment precautions.
   - `detail` (string): Detailed explanation of the procedure and mechanism.
   - `effect` (string): Expected outcome/effect on the skin.

10. **therapy.recommend_therapy**

    - A single string with the recommended therapy name (e.g., “Aqua Peeling”).

## Architecture

Skincare-MCP is built using:

- **TypeScript** (Node.js runtime)
- **@modelcontextprotocol/sdk** (MCP TypeScript SDK for tool registration and message handling)
- **Zod** (for schema validation of incoming parameters)
- **Express.js** (or similar HTTP server framework) to handle the HTTP `POST` endpoint and route requests internally
- **Internal ML Model** (Python ONNX or TensorFlow backend) to perform image-based skin analysis
- **Sharp** or **Jimp** (Node.js image processing) to fetch and pre-process images from URLs before feeding them to the ML model

### Manual Installation

```bash
# 1. Clone the repository
git clone [https://github.com/yourusername/skincare-mcp.git](https://github.com/leegentle/skincare-mcp.git)
cd skincare-mcp

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. (Optional) Run tests
npm test

# 5. Start the server
npm start
```

After starting, the server listens on a default port (e.g., `3000`) and can be invoked by an MCP client at:

```
mcp://localhost:3000/get-skin-analysis
```

## Usage

### With Claude Desktop App

1. Download and install [Claude Desktop App](https://claude.ai).
2. Open Claude Desktop settings, then go to **Developer** settings.
3. Edit your configuration file (e.g., `config.json`) to include:

   ```json
   {
     "mcpServers": {
       "skincare": {
         "command": "node path/to/skincare-mcp/build/index.js"
       }
     }
   }
   ```

4. Restart Claude Desktop.
5. You will now see a “get-skin-analysis” tool under the “skincare” server when interacting with Claude.

### Example Queries

Once connected, you can ask your MCP-capable client (e.g., Claude Desktop) to run commands like:

- “Analyze my skin: `get-skin-analysis image_url=https://example.com/selfie.jpg`”
- “What management methods should I follow for my skin?” (the client can automatically call `get-skin-analysis` behind the scenes)
- “Recommend a therapy based on my skin condition”

## Adding New Features

To extend Skincare-MCP with additional tools or analyses:

1. **Define new Zod schemas** in `src/types.ts` for any additional input parameters or output fields.
2. **Create helper functions** in `src/utils/` (e.g., data fetchers, new model inferences).
3. **Register a new tool** in `src/tools.ts` using:

   ```ts
   server.tool(
     "new-skin-tool",
     "Description of this new tool’s functionality.",
     {
       /* input parameter schema via Zod */
     },
     async (params) => {
       // Tool logic: fetch/process image, call model, return JSON
     }
   );
   ```

4. **Update `src/index.ts`** to import and include the new tool.
5. **Write unit/integration tests** under `tests/` to validate new functionality.
6. **Rebuild and restart** the server to make the new tool available to MCP clients.

## Acknowledgments

- [Model Context Protocol](https://modelcontextprotocol.io) for providing a standardized way to expose external tools to AI clients.
- Internal ML teams for developing the skin-analysis models.
- [Smithery](https://smithery.ai) for MCP deployment and discovery services.

---

**About**
Skincare-MCP is maintained by the @leegentle team. It demonstrates how to build a domain-specific MCP server—focused on skin diagnostics—that can seamlessly integrate into AI workflows and client applications.

[1]: https://github.com/NaveenBandarage/poke-mcp "GitHub - NaveenBandarage/poke-mcp: A repo to play around with MCP (Model Context Protocol) and to query the PokeDex API"
