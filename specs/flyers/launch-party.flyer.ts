import { type FlyerSpec, FlyerSpecSchema, FORMAT_PRESETS } from "../schemas/flyer.schema.ts";

export const launchPartyFlyerSpec: FlyerSpec = FlyerSpecSchema.parse({
  id: "flyer-ai-launch-night",
  version: "1.0.0",
  status: "frozen",
  metadata: {
    title: "AI Launch Night & Showcase",
    description: "Flyer promocional para evento nocturno de lanzamiento tecnológico y networking",
    author: "User + Flyer-Designer",
    createdAt: "2026-09-27T23:50:00Z",
  },
  format: "portrait-feed", // 1080x1350 (4:5 para Instagram/Mobile)
  dimensions: FORMAT_PRESETS["portrait-feed"],
  style: "tech-neon",
  colors: {
    background: "#090A0F",
    surface: "#12141F",
    primaryText: "#FFFFFF",
    secondaryText: "#94A3B8",
    accent: "#38BDF8", // Cyan Neon
  },
  content: {
    eyebrow: "EXCLUSIVA • BOGOTÁ TECH WEEK",
    headline: "AI LAUNCH NIGHT 2026",
    subheadline: "La convergencia de agentes autónomos, diseño generativo y el futuro del software.",
    eventDetails: [
      { label: "FECHA", value: "OCTUBRE 15" },
      { label: "HORA", value: "07:30 PM" },
      { label: "LUGAR", value: "SECTOR CHICÓ • HUB TECH" },
      { label: "ENTRADA", value: "INVITACIÓN VIP" },
    ],
    cta: {
      text: "RESERVA TU ACCESO VIP",
      subtext: "Cupos limitados • Entrada con código QR",
      linkOrHandle: "launch.paper.design",
    },
    heroImage: {
      prompt: "Abstract futuristic glowing geometric prism, dark cinematic lighting, neon cyan accents, 8k render",
      model: "recraft-v4-1",
      aspectRatio: "1:1",
    },
    sponsors: ["PAPER.DESIGN", "ANTIGRAVITY", "VERCEL"],
  },
  acceptanceCriteria: [
    {
      id: "FC-01",
      description: "El titular 'AI LAUNCH NIGHT 2026' debe utilizar fuente display pesada con font-size mínimo de 56px.",
    },
    {
      id: "FC-02",
      description: "El fondo debe utilizar el tono oscuro #090A0F con acento neón #38BDF8 de alto contraste.",
    },
    {
      id: "FC-03",
      description: "El bloque de detalles del evento debe estar estructurado en una grilla o tarjetas de 2 columnas.",
    },
  ],
});
