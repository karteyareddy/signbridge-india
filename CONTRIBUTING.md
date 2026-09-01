# Contributing to SIGNBRIDGE INDIA 🤟

Thank you for your interest in contributing to **SignBridge India**! We welcome developers, UX designers, ISL linguists, and accessibility advocates to help us build a Deaf-first accessibility layer for Indian Sign Language.

---

## 📜 Core Guiding Principles

Before submitting code, please align with our core design and technical principles:
1. **Deaf-First Respect**: AI is an assistance layer, not a replacement for certified ISL interpreters or the Deaf community.
2. **Constrained & Safe AI**: Never claim universal translation. All predictions must have confidence thresholds (`>85%`) with graceful fallbacks.
3. **Zero Biometric Storage**: Never log or store raw video/camera frames. Only ephemeral landmark coordinates are processed.
4. **Mobile-First & Accessible**: All UI must adhere to WCAG 2.1 AA standards and support offline PWA usage.
5. **No Secrets Exposed**: Never commit Supabase service-role keys or sensitive credentials.

---

## 🛠️ How to Contribute

### 1. Reporting Bugs
- Search existing [GitHub Issues](https://github.com/your-org/signbridge-india/issues) to avoid duplicates.
- Use the **Bug Report** issue template.
- Clearly describe expected vs. actual behavior, browser/OS versions, and steps to reproduce.

### 2. Feature Requests
- Check [PRD.md](PRD.md) to confirm your suggestion fits the product scope.
- Use the **Feature Request** issue template.
- Explain the real-world value for Deaf citizens, hearing service staff, or institution administrators.

### 3. Submitting Pull Requests (PRs)

1. **Fork & Branch**:
   Fork the repository and create a branch off `main`:
   ```bash
   git checkout -b feat/access-point-counter-ui
   # or
   git checkout -b fix/mediapipe-landmark-normalization
   ```

2. **Branch Naming Conventions**:
   - `feat/feature-name`: New features or components
   - `fix/bug-name`: Bug fixes
   - `docs/doc-name`: Documentation updates
   - `refactor/scope`: Code cleanup without behavior change
   - `test/test-scope`: Adding unit or integration tests

3. **Follow Code Standards**:
   - **Frontend**: Next.js 14 App Router, TypeScript (strict), Tailwind CSS, Lucide icons.
   - **Backend**: Python 3.10+, FastAPI, PyTorch/ONNX, Pytest.
   - **Linting & Formatting**: Ensure `npm run lint` and `npm run build` pass cleanly without errors.

4. **Run Tests**:
   - Frontend: `npm test`
   - Backend: `cd apps/api && pytest`

5. **Commit Message Format**:
   Write clear, imperative commit messages:
   ```
   feat(access-point): add offline caching fallback for service packs
   fix(ai-api): apply threshold confidence gating on predict response
   docs(readme): add setup guide for local FastAPI inference server
   ```

6. **Submit PR**:
   Open a Pull Request targeting `main`. Fill out the PR template completely and link related issues.

---

## 🧪 Testing Checklist

Every PR must satisfy:
- [ ] Code compiles without TypeScript errors (`npm run build`).
- [ ] ESLint passes without errors (`npm run lint`).
- [ ] Unit tests pass (`npm test` and `pytest`).
- [ ] UI states handled: **Loading**, **Success**, **Empty**, and **Error**.
- [ ] Keyboard navigation and screen reader accessibility verified.

---

## 💬 Community & Governance

- Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) in all interactions.
- Questions? Feel free to open a Discussion on GitHub or reach out to the project maintainers.
