/* Structure — the Kwapso design language. React surface.
 *
 * These components render the class names defined in css/. There is no styling
 * logic in React, so the plain-HTML and React surfaces cannot drift: one
 * implementation, two front doors.
 *
 *   import { Button, AppShell, DataTable, Chat } from "@kwapso/structure/react"
 *   import "@kwapso/structure/structure.css"
 *
 * registry.json lists every item the system promises, and
 * `npm run check:coverage` proves each one resolves to a real class and a real
 * export — so the inventory cannot quietly become a wish-list.
 */
export * from "./theme"
export * from "./layout"
export * from "./controls"
export * from "./inputs"
export * from "./surfaces"
export * from "./navigation"
export * from "./overlay"
export * from "./chat"
export * from "./loaders"
export * from "./states"
export * from "./screens"
export * from "./data"
export * from "./patterns"
export * from "./motion"
export { default as tokens } from "../dist/tokens.js"
