# Anti-AI Slop: Erradicación de Clichés Visuales de IA

Los modelos de lenguaje tienden a converger en patrones visuales predecibles y de baja calidad cuando diseñan interfaces sin restricciones. Este documento prohíbe explícitamente esos vicios y establece alternativas profesionales.

---

## 1. Patrones Prohibidos vs Alternativas Profesionales

| Vicio Típico de IA (AI Slop) | Por qué está mal | Alternativa Obligatoria |
| :--- | :--- | :--- |
| **Gradientes Púrpura-Cian Genéricos** | Hace que cualquier producto parezca una demo barata de Web3 o IA de 2023. | Paletas sobrias basadas en el sistema de diseño: neutros profundos (`#0F172A`, `#090A0F`), superficies con contraste sutil y **un solo color de acento intencional** con presencia $\le 10\%$. |
| **Esquinas de Jabón (`border-radius: 32px` en todo)** | Destruye la estructura rectangular de la información y desperdicia espacio en esquinas. | Usar radios estructurados: `6px` a `8px` para inputs y botones, `12px` a `16px` para tarjetas principales. |
| **Tarjetas Flotantes sin Jerarquía (Card Soup)** | Envolver cada párrafo o icono en una tarjeta con borde y sombra independiente crea ruido cognitivo. | Agrupar por regiones comunes de Gestalt. Usar divisores sutiles (`1px solid rgba(255,255,255,0.08)`) o fondos alternados en vez de cajas infinitas. |
| **Bordes de 100% Opacidad en Dark Mode** | Los bordes `#FFFFFF` o grises sólidos en fondos oscuros vibran y saturan la vista. | Usar **Hairline borders** con opacidades bajas: `rgba(255, 255, 255, 0.08)` o `rgba(255, 255, 255, 0.12)`. |
| **Sombras Negras Duras (`box-shadow: 0 10px 20px #000`)** | Parecen recortes de Photoshop de los 2000. | Sombras compuestas multicapa difuminadas o elevación por luminosidad de superficie (en dark mode, las superficies elevadas son ligeramente más claras). |
| **Iconos Huérfanos Decorativos** | Poner un icono aleatorio al lado de cada etiqueta sin significado funcional. | Cada icono debe aportar contexto o acción rápida. Si el texto se sostiene solo, prescindir del icono. |

---

## 2. Regla de Oro del Acabado Visual
> *"La excelencia en diseño de software no proviene de añadir efectos, sino de la precisión matemática en espaciados, el ritmo tipográfico y la sobriedad en el color."*
