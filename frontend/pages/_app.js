// pup-pantry/frontend/pages/_app.js
import Header from "../components/Header";

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Header />
      <Component {...pageProps} />

      {/* Global theme (blue / orange / white / black) */}
      <style jsx global>{`
        :root {
          --pp-bg: #ffffff;
          --pp-surface: #f7f9fc;
          --pp-text: #0b1220;
          --pp-muted: #667085;
          --pp-border: #e6e8ee;

          --pp-primary: #1565d8; /* blue */
          --pp-primary-600: #0f57bf;
          --pp-primary-700: #0a4aa7;

          --pp-accent: #ff7a00; /* orange */
          --pp-accent-600: #e86c00;

          --pp-success: #28a745;
          --pp-danger: #d92d20;
        }

        /* Reset-ish */
        *,
        *::before,
        *::after {
          box-sizing: border-box;
        }
        html,
        body {
          padding: 0;
          margin: 0;
          background: var(--pp-surface);
          color: var(--pp-text);
          font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial,
            sans-serif;
          line-height: 1.5;
        }
        img {
          max-width: 100%;
          display: block;
        }
        code,
        pre {
          font-family: ui-monospace, SFMono-Regular, Menlo, Consolas,
            "Liberation Mono", monospace;
          background: #0b122003;
          padding: 0.1rem 0.35rem;
          border-radius: 6px;
        }

        /* Headings */
        h1,
        h2,
        h3 {
          margin: 0.3rem 0 0.75rem 0;
          line-height: 1.2;
        }
        h1 {
          font-size: clamp(1.4rem, 1.2rem + 1.2vw, 2rem);
        }
        h2 {
          font-size: clamp(1.2rem, 1.05rem + 0.9vw, 1.6rem);
        }
        h3 {
          font-size: 1.1rem;
        }

        /* Links */
        a {
          color: var(--pp-primary);
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
        a:focus-visible {
          outline: 3px solid #1565d84d;
          outline-offset: 2px;
          border-radius: 6px;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          height: 36px;
          padding: 0 12px;
          border-radius: 10px;
          border: 1px solid var(--pp-border);
          background: #fff;
          color: var(--pp-text);
          cursor: pointer;
          transition: box-shadow 0.15s ease, transform 0.02s ease,
            border-color 0.15s ease, background 0.15s ease;
          font-weight: 600;
        }
        .btn:hover {
          box-shadow: 0 1px 0 rgba(16, 24, 40, 0.06),
            0 1px 2px rgba(16, 24, 40, 0.08);
        }
        .btn:active {
          transform: translateY(1px);
        }
        .btn:focus-visible {
          outline: 3px solid #1565d84d;
          outline-offset: 2px;
        }
        .btn[disabled] {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--pp-primary);
          color: #fff;
          border-color: var(--pp-primary);
        }
        .btn-primary:hover {
          background: var(--pp-primary-600);
          border-color: var(--pp-primary-600);
        }
        .btn-accent {
          background: var(--pp-accent);
          color: #101828;
          border-color: var(--pp-accent);
        }
        .btn-outline {
          background: #fff;
          color: var(--pp-primary);
          border-color: var(--pp-primary);
        }
        .btn-outline:hover {
          background: #f5f8ff;
          border-color: var(--pp-primary-600);
          color: var(--pp-primary-600);
        }
        .btn-danger {
          background: #fff;
          color: var(--pp-danger);
          border-color: #ffd6d6;
        }
        .btn-danger:hover {
          background: #fff1f1;
          border-color: #ffb8b8;
        }

        /* Inputs / selects / textarea */
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"],
        select,
        textarea {
          background: #fff;
          border: 1px solid var(--pp-border);
          border-radius: 10px;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--pp-text);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        input::placeholder,
        textarea::placeholder {
          color: var(--pp-muted);
        }
        input:focus,
        select:focus,
        textarea:focus {
          border-color: var(--pp-primary);
          box-shadow: 0 0 0 3px #1565d81f;
        }
        label {
          font-weight: 600;
          color: #111827;
        }

        /* Cards */
        .card {
          background: #fff;
          border: 1px solid var(--pp-border);
          border-radius: 14px;
          padding: 14px 16px;
          box-shadow: 0 1px 0 rgba(16, 24, 40, 0.04);
        }
        .card + .card {
          margin-top: 10px;
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        /* Chips / badges */
        .chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #fff;
          border: 1px solid var(--pp-border);
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 13px;
        }
        .chip strong {
          margin-right: 2px;
        }
        .badge {
          display: inline-block;
          font-size: 12px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 999px;
        }
        .badge-safe {
          background: #e8f7ee;
          color: #0e6f3b;
          border: 1px solid #ccead7;
        }
        .badge-unsafe {
          background: #fff1f1;
          color: #b42318;
          border: 1px solid #ffd6d6;
        }
        .badge-stock {
          background: #eef4ff;
          color: #173ea7;
          border: 1px solid #dae4ff;
        }

        /* Lists */
        ul.clean {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .list-grid {
          display: grid;
          gap: 12px;
        }

        /* Utilities */
        .row {
          display: inline-flex;
          align-items: center;
          gap: 10px;
        }
        .stack {
          display: grid;
          gap: 10px;
        }
        .muted {
          color: var(--pp-muted);
        }
        .text-success {
          color: var(--pp-success);
        }
        .text-danger {
          color: var(--pp-danger);
        }
        .text-right {
          text-align: right;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          background: #fff;
          border: 1px solid var(--pp-border);
          font-size: 12px;
          color: var(--pp-muted);
        }

        /* Tables (used on admin-ish sections) */
        table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        th,
        td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--pp-border);
          text-align: left;
        }
        th {
          font-size: 13px;
          color: var(--pp-muted);
          font-weight: 700;
        }
        tr:last-child td {
          border-bottom: none;
        }

        /* Make "main" areas breathe a bit on small screens */
        main {
          scroll-margin-top: 90px;
        }
      `}</style>
    </>
  );
}
