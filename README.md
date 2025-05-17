# Grey Matter

Grey Matter is a web application that explores how advanced AI models, specifically OpenAI's GPT-4o, approach moral dilemmas using different ethical frameworks. Users can take interactive quizzes, view AI-generated ethical reasoning, and analyze the distribution of ethical frameworks applied by the AI. This project is designed for those interested in AI alignment, ethics, and the intersection of technology and philosophy.

## Features

- **Ethical Dilemma Quiz**: Take a quiz to see how GPT-4o responds to various moral dilemmas.
- **AI Ethical Framework Analysis**: Visualize which ethical frameworks (deontology, consequentialism, utilitarianism, relational ethics, etc.) the AI tends to use.
- **Dilemma-Specific Insights**: Dive into detailed analysis for each dilemma, including the AI's choice, reasoning, and framework.
- **Modern UI**: Built with shadcn/ui, Tailwind CSS, and Radix UI for a clean, responsive experience.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [pnpm](https://pnpm.io/) or [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Grey-Matter
   ```
2. **Install dependencies:**
   ```bash
   pnpm install
   # or
   npm install
   # or
   yarn install
   ```
3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add the following (replace with your actual keys):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   OPENAI_API_KEY=your-openai-api-key
   ```

### Running the App

- **Development:**
  ```bash
  pnpm dev
  # or
  npm run dev
  # or
  yarn dev
  ```
- **Production Build:**
  ```bash
  pnpm build && pnpm start
  # or
  npm run build && npm start
  # or
  yarn build && yarn start
  ```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Tech Stack
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Supabase](https://supabase.com/)
- [OpenAI API](https://platform.openai.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Project Structure
- `app/` — Main application pages and logic
- `components/` — Reusable UI components
- `lib/` — Utility libraries and Supabase client
- `hooks/` — Custom React hooks
- `public/` — Static assets
- `styles/` — Global and component styles

## License

This project is for educational and research purposes. Please see `LICENSE` (if present) for more details.

---

*Created with ❤️ using Next.js, shadcn/ui, and OpenAI.* 