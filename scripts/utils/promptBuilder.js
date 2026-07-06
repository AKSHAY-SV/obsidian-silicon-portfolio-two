export const TRUSTED_SOURCES = [
  "Intel", "AMD", "NVIDIA", "TSMC", "Samsung Foundry", "GlobalFoundries", 
  "ARM", "Qualcomm", "Synopsys", "Cadence", "Siemens EDA", "RISC-V International", 
  "Google Research", "OpenROAD", "OpenLane", "SkyWater", "Semiconductor Engineering", 
  "EE Times", "IEEE Spectrum", "Nature Electronics", "ACM", "DAC", "ISSCC", 
  "Hot Chips", "VLSI Symposium"
];

export const promptBuilder = {
  buildNewsPrompt: (currentDate) => {
    return `Search the web for the absolute latest, high-impact semiconductor industry news, processor design launches, foundry advancements, and hardware announcements from around ${currentDate}.
Focus exclusively on trusted engineering sources, including: ${TRUSTED_SOURCES.join(", ")}.

CRITICAL FILTERS:
- ONLY compile engineering and technical developments.
- IGNORE politics, general consumer tech, stocks/finance (unless strictly related to process technology), entertainment, and general company hiring news.
- Maintain a highly sophisticated, technical, IEEE Spectrum-inspired tone.

Ensure every record contains deep, descriptive insights for "whyItMatters" and "industryImpact" (minimum 2 sentences each) and real, valid links if found.`;
  },

  buildPapersPrompt: (currentDate) => {
    return `Search the web for outstanding, recent (or around ${currentDate}) semiconductor research papers, IEEE/ACM publications, and technical breakthroughs presented at prestigious forums like ISSCC, DAC, VLSI Symposium, Hot Chips, or published in Nature Electronics or Google Research.
Focus on topics like:
- Advanced lithography (EUV, High-NA EUV)
- GAAFET/RibbonFET innovations
- Backside Power Delivery Networks (BSPDN)
- Advanced packaging, Chiplets, High-Bandwidth Memory (HBM4)
- Open-source EDA tooling (OpenLane, OpenROAD)
- RISC-V extensions and custom hardware accelerators.

Provide detailed academic summaries, applications, and industry relevance. All articles should read like professional, state-of-the-art semiconductor reports.`;
  },

  buildTrendingPrompt: (currentDate) => {
    return `Analyze recent semiconductor engineering literature, news, and releases around ${currentDate}. 
Determine the most discussed and breakthrough technologies (e.g., Chiplets, HBM4, OpenLane, Sky130, OpenROAD, UCIe, GAAFET, RibbonFET, RISC-V, Photonic Computing, Advanced Packaging).
Generate a set of 7 trending silicon technologies with descriptive statuses.
Also, compile:
1. Weekly and monthly statistics.
2. Technology popularity and rankings.
3. Most discussed company and technology.
4. An editorial focus with a technical focus title and a deep editorial paragraph summarizing the key themes of this week's breakthroughs. Ensure the issue number is at least 143.`;
  }
};
