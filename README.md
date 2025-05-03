# FlashAI

## Project Description

FlashAI is a web application designed to streamline the creation and learning of educational flashcards. Leveraging AI, FlashAI generates flashcards from user-provided text, enabling users to quickly create study materials. Users can then review, edit, and organize their flashcards, and learn using an integrated spaced repetition algorithm. FlashAI aims to simplify and accelerate the process of creating effective learning materials, assisting users in preparing for exams and other educational endeavors.

## Tech Stack

*   **Frontend:**
    *   Astro 5: For building fast and efficient web pages with minimal JavaScript.
    *   React 19:  For interactive components.
    *   TypeScript 5: For static typing and improved IDE support.
    *   Tailwind 4: For utility-first CSS styling.
    *   Shadcn/ui:  For accessible React components.
*   **Backend:**
    *   Supabase:  A comprehensive backend solution providing:
        *   PostgreSQL database
        *   Backend-as-a-Service SDKs
        *   Open-source and self-hostable
        *   Built-in user authentication
*   **AI:**
    *   Openrouter.ai: Provides access to various AI models (OpenAI, Anthropic, Google, etc.) for effective and cost-efficient flashcard generation.
*   **CI/CD and Hosting:**
    *   GitHub Actions: For CI/CD pipelines.
    *   DigitalOcean: For hosting the application via Docker.

## Getting Started Locally

1.  **Clone the repository:**
    ```bash
    git clone git@github.com:FilipTrocin/FlashAI.git
    cd flashai
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Set up Supabase:**
    *   Create a Supabase project.
    *   Configure environment variables for Supabase URL and API key (in `.env` file).
    *   Run database migrations (if any).

4.  **Set up Openrouter.ai:**
    *   Create an account on Openrouter.ai.
    *   Obtain an API key.
    *   Configure the API key as an environment variable.

5.  **Run the development server:**
    ```bash
    bun run dev
    ```

   This will start the Astro development server. Open your browser and navigate to the address provided in the console.

## Available Scripts

*   `dev`: Starts the development server.
    ```bash
    bun run dev
    ```
*   `build`: Builds the application for production.
    ```bash
    bun run build
    ```
*   `preview`:  Previews the production build locally.
    ```bash
    bun run preview
    ```

## Project Scope

This project implements a Minimum Viable Product (MVP) with the following limitations:

*   No advanced spaced repetition algorithm (like SuperMemo or Anki).
*   Limited import formats (currently supports only manual text input).
*   No flashcard set sharing between users.
*   No integrations with other educational platforms.
*   Web application only (no mobile apps).

## Project Status

Currently, the project is in active development.

## License

MIT License