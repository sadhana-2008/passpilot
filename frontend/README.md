# PassPilot – Frontend

PassPilot is an AI passport readiness assistant shell built with Vite, React 19, TypeScript, and Tailwind CSS v4.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation
From the repository root or the `frontend` directory:

```bash
cd frontend
npm install
```

### Running the Development Server

Start Vite with hot module replacement (HMR):

```bash
npm run dev
```

Open your browser at [http://localhost:5173/](http://localhost:5173/).

### Building for Production

Compile TypeScript and build the optimized production assets:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Design System & Architecture

- **Tailwind v4 Setup**: Uses the `@tailwindcss/vite` plugin and `@import "tailwindcss"` in `src/index.css`.
- **Theme Tokens & CSS Variables**:
  - Background: `#0E0E10`, Panel: `#151517`, Raised: `#1B1B1E`, Border: `#2A2A2E`
  - Text Primary: `#E8E6E1`, Secondary: `#8F8D88`, Muted: `#5F5D59`
  - Accent: `#CFC9BD` (warm stone with dark text `#1B1B1E`)
  - Status: `#7FA88A` (OK), `#C9A45C` (Warning), `#B56A63` (Danger) with 12% tinted badge backgrounds.
  - Fonts: Inter Variable for UI, JetBrains Mono Variable for tool and code tokens.
  - Radii: 10px panels, 8px buttons, 1px borders.
- **Layout**: Strict `h-screen` viewport, zero page scroll at `1366x768` and `1920x1080` screen sizes. Three-column grid: `300px | minmax(0, 1fr) | 320px` with 16px gap and padding.
- **Accessibility**: Full keyboard support (`Tab`, `Shift+Tab`, `ArrowLeft`/`ArrowRight` tabs, `Escape` on modals), focus-visible outlines in the accent color, semantic ARIA roles (`role="dialog"`, `role="tablist"`, `role="tab"`, `role="progressbar"`), and descriptive `aria-label` tags on all icon/interactive controls.
