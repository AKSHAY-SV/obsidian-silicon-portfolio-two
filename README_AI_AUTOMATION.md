# Obsidian Silicon: Autonomous Engineering Intelligence Platform

This repository houses the **Autonomous Semiconductor Engineering Intelligence Platform**—a zero-ops, self-updating data intelligence layer that tracks breakthrough microarchitectural updates, academic publications, and industry trends.

The platform is designed to be fully decoupled and resilient. It runs daily as a high-fidelity ingestion pipeline, utilizing **Google Gemini with Google Search Grounding** to compile and structure raw semiconductor news, verified ISSCC/DAC research papers, and EDA advancements into schemas, which are then validated and committed directly to the repository.

---

## Architecture Overview

The system consists of three main segments:
1. **The Ingestors (`scripts/generate*.js`)**: Node.js scripts that interface with the `@google/genai` SDK using `gemini-3.5-flash`. These leverage live search-grounding tools to query, filter, and structure raw engineering developments around the world.
2. **The Verification & Enforcers (`scripts/validateJson.js` & `cleanup.js`)**: Guardrails that validate incoming data payloads, perform deduplication, remove invalid references, and ensure zero duplicate IDs, URLs, or titles ever reach production.
3. **The Deployment Automator (`.github/workflows/update-intelligence.yml`)**: A production-grade workflow running on a daily cron schedule that installs, compiles, validates, performs a zero-delta diff check, and publishes commits automatically.

```
       [ Daily Cron Event ]
                 │
                 ▼
     [ GitHub Actions Container ]
                 │
     ┌───────────┴───────────┐
     ▼                       ▼
[News Generator]       [Papers Generator]
     │                       │
     └───────────┬───────────┘
                 ▼
     [Trends & Digest Compiler]
                 │
                 ▼
      [System Cleanup & Pruning]
                 │
                 ▼
     [Deep JSON Schema Validation]
                 │
                 ▼
   [Zero-Delta Git Diff Compare]
                 │
       ┌─────────┴─────────┐
       ▼                   ▼
 (Changes Found)     (No New Updates)
       │                   │
       ▼                   ▼
 [Git Push main]       [Skip Commit]
```

---

## Project Structure

```bash
.github/
  workflows/
    update-intelligence.yml   # Production pipeline cron runner
scripts/
  generateNews.js             # High-impact news generator
  generatePapers.js           # IEEE/ACM research compiler
  generateTrending.js         # Tech trends metric compiler
  validateJson.js             # Schema validation and duplicate checker
  cleanup.js                  # Cache cleaner and duplicate pruner
  compareFeeds.js             # Zero-delta change detector
  utils/
    logger.js                 # Terminal color logging utility
    geminiClient.js           # Centralized GoogleGenAI client singleton
    promptBuilder.js          # Ingestion prompt structures
    jsonValidator.js          # Raw payload structures
    fileWriter.js             # Safe JSON file exporter
    retry.js                  # Exponential backoff retry handler
    cache.js                  # Temp file system cacher
    validator.js              # Duplicate detector
    json.js                   # JSON strip-markdown helper
```

---

## Detailed Data Pipeline

### 1. Ingestion with Search Grounding
Instead of standard static knowledge-cutoff text generation, the ingestors run with live search grounding active:
```javascript
const response = await ai.models.generateContent({
  model: "gemini-3.5-flash",
  contents: prompt,
  config: {
    tools: [{ googleSearch: {} }] // Connects the model with Google Search
  }
});
```
This queries real-time web repositories, hardware announcements, and semiconductor foundry channels, mapping actual events into strict JSON models.

### 2. Error Recovery & Retries
To withstand API limits, temporary network failures, or transient latency spikes, we utilize an exponential backoff retry mechanism (`withRetry`):
- If the model query fails, the script waits and retries up to 3 times before failing gracefully.
- If all retries fail, previous JSON feeds remain fully intact, preventing any service downtime or empty frontend updates.

### 3. Cleanup & Schema Verification
- **Deduplication**: Runs prior to schema verification to prune articles sharing identical titles, unique identifiers, or source URLs.
- **Verification**: Assures structured keys (`whyItMatters`, `industryImpact`, `difficulty`, `readingTime`, `technologyTags`, etc.) are fully populated. Duplicate entries or malformed objects cause the pipeline to immediately abort.

### 4. Zero-Delta History Protection
To avoid polluting the Git commit log with empty updates or trivial timestamp rewrites, `compareFeeds.js` runs a check. If no genuine structural updates exist, the workflow terminates successfully without pushing changes.

---

## Local Development & Execution

To test the intelligence compilers locally, follow these steps:

### 1. Configure Secrets
Create a `.env` file at the project root (do not commit this file):
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### 2. Execute Generators
You can run individual compilers directly using Node:
```bash
# Compile latest news
node scripts/generateNews.js

# Compile research publications
node scripts/generatePapers.js

# Compile tech trends
node scripts/generateTrending.js
```

### 3. Run Quality Pipeline
Run verification, cleanup, and comparison manually:
```bash
# Clean up cache and duplicates
node scripts/cleanup.js

# Run full JSON schema verification
node scripts/validateJson.js

# Check for modifications
node scripts/compareFeeds.js
```

---

## GitHub Actions Workflow Integration

To wire the pipeline in your repository:
1. Navigate to your GitHub repository.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Create a **New repository secret** named `GEMINI_API_KEY` and paste your Gemini API credentials.
4. Go to **Settings** > **Actions** > **General**, and under **Workflow permissions**, ensure **Read and write permissions** are enabled so the pipeline can push verified changes.

The workflow is configured with `workflow_dispatch`, allowing you to trigger runs at any time directly from the **Actions** tab in GitHub.
