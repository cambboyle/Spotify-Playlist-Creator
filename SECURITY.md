Do NOT commit secrets (API keys, client IDs, client secrets, tokens) to this repository.

If you need to store configuration for local development, create a `.env` file in the project root and ensure `.gitignore` contains `.env` (this repo already does). Do not commit the `.env` file.

If you accidentally committed a `.env`, see `README.md` for instructions on removing it from history or rotate the credentials.

If you're sharing the project or creating a demo, create throwaway credentials or use environment-specific configuration that does not expose private values.
