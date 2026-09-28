---
name: sync-tokens
description: Sincroniza tokens de diseño bidireccionalmente entre los archivos locales en design-system/tokens/ y el canvas de Paper mediante Paper MCP.
---

# Workflow: /sync-tokens

Este workflow asegura que los tokens definidos en código (`design-system/tokens/`) y las variables en Paper permanezcan en perfecta paridad.

---

## Modos de Sincronización

### 1. Push: Local -> Paper Canvas
1. Lee `design-system/tokens/colors.json`, `typography.json` y `spacing.json`.
2. Llama a `get_tokens` en Paper MCP para conocer las variables existentes.
3. Si los tokens no existen, llama a `create_tokens`.
4. Si ya existen con valores diferentes, actualiza con `set_tokens`.
5. Confirma la lista de tokens registrados.

### 2. Pull: Paper Canvas -> Local
1. Llama a `get_tokens` en Paper MCP.
2. Si el usuario definió nuevos tokens en Paper, actualiza `design-system/tokens/colors.json` o `typography.json`.
3. Registra el diff en Git para control de versiones.
