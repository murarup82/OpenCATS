<?php /* GDPR Consent Public Page */ ?>
<?php
    $currentLang = isset($this->currentLang) ? strtolower(trim($this->currentLang)) : 'en';
    if ($currentLang === '')
    {
        $currentLang = 'en';
    }

    $uiCopy = isset($this->uiCopy) && is_array($this->uiCopy) ? $this->uiCopy : array();
    $eyebrow = isset($uiCopy['eyebrow']) ? $uiCopy['eyebrow'] : 'Privacy Consent';
    $securePublicLink = isset($uiCopy['securePublicLink']) ? $uiCopy['securePublicLink'] : 'Secure Public Link';
    $intro = isset($uiCopy['intro']) ? $uiCopy['intro'] : 'Review the notice below and choose whether you consent to data processing for recruitment activities.';
    $languageLabel = isset($uiCopy['languageLabel']) ? $uiCopy['languageLabel'] : 'Language';
    $languageNavLabel = isset($uiCopy['languageNavLabel']) ? $uiCopy['languageNavLabel'] : 'Choose consent language';
    $acceptButton = isset($uiCopy['acceptButton']) ? $uiCopy['acceptButton'] : 'Accept Consent';
    $declineButton = isset($uiCopy['declineButton']) ? $uiCopy['declineButton'] : 'Decline';
    $footnote = isset($uiCopy['footnote']) ? $uiCopy['footnote'] : 'This consent link expires automatically if no response is submitted.';

    $formAction = isset($this->formAction) && trim($this->formAction) !== '' ? trim($this->formAction) : 'consent.php';
    $tokenParam = isset($this->token) ? urlencode($this->token) : '';
    $messageTone = isset($this->messageTone) ? strtolower(trim((string) $this->messageTone)) : 'info';
    if ($messageTone !== 'success' && $messageTone !== 'warning')
    {
        $messageTone = 'info';
    }
    $isAlert = !empty($this->isAlert);
?>
<!DOCTYPE html>
<html lang="<?php echo htmlspecialchars($currentLang); ?>">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php $this->_($this->title); ?></title>
    <style>
        :root {
            --gdpr-50: #f4fbff;
            --gdpr-100: #e6f4fa;
            --gdpr-200: #d9efff;
            --gdpr-300: #b9dff0;
            --gdpr-400: #7bc2dd;
            --gdpr-500: #38b1cc;
            --gdpr-600: #0097bd;
            --gdpr-700: #006d90;
            --gdpr-800: #005471;
            --gdpr-900: #00425b;
            --gdpr-bg-base: #edf5fa;
            --gdpr-bg-card: #ffffff;
            --gdpr-bg-subtle: #f8fcff;
            --gdpr-text-primary: #0d3344;
            --gdpr-text-secondary: #446677;
            --gdpr-text-muted: #5e7c8d;
            --gdpr-border-subtle: #c7ddea;
            --gdpr-border-strong: #9bc4d9;
            --gdpr-accent: var(--gdpr-700);
            --gdpr-accent-strong: var(--gdpr-900);
            --gdpr-accent-soft: #e9f6fd;
            --gdpr-success-soft: #edf9f1;
            --gdpr-success-strong: #1f7145;
            --gdpr-warning-soft: #fff8ec;
            --gdpr-warning-strong: #84501b;
            --gdpr-shadow:
                0 0 0 1px rgba(0, 66, 91, 0.06),
                0 8px 20px rgba(0, 66, 91, 0.09),
                0 18px 38px rgba(0, 66, 91, 0.13);
            --gdpr-radius-lg: 20px;
            --gdpr-radius-md: 14px;
            --gdpr-radius-sm: 11px;
            --gdpr-focus-ring: 0 0 0 3px rgba(0, 151, 189, 0.3);
            --gdpr-font: "Trebuchet MS", "Segoe UI", Tahoma, sans-serif;
            --gdpr-title-font: "Segoe UI Semibold", "Trebuchet MS", "Segoe UI", Tahoma, sans-serif;
        }

        *,
        *::before,
        *::after {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            min-height: 100vh;
            font: 400 15px/1.6 var(--gdpr-font);
            color: var(--gdpr-text-primary);
            background:
                radial-gradient(circle at 12% 8%, rgba(56, 177, 204, 0.16) 0%, rgba(56, 177, 204, 0) 36%),
                radial-gradient(circle at 88% 22%, rgba(0, 151, 189, 0.14) 0%, rgba(0, 151, 189, 0) 34%),
                radial-gradient(circle at 50% 100%, rgba(0, 109, 144, 0.08) 0%, rgba(0, 109, 144, 0) 42%),
                linear-gradient(180deg, #f4fafe 0%, #edf5fa 56%, #f5fbff 100%),
                var(--gdpr-bg-base);
        }

        .gdpr-page {
            min-height: 100vh;
            width: 100%;
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .gdpr-shell {
            width: min(760px, 100%);
            border: 1px solid var(--gdpr-border-subtle);
            border-radius: var(--gdpr-radius-lg);
            background:
                radial-gradient(circle at 0% 0%, rgba(56, 177, 204, 0.16) 0%, rgba(56, 177, 204, 0) 44%),
                linear-gradient(130deg, #f7fcff 0%, #ffffff 58%, #f9fdff 100%);
            box-shadow: var(--gdpr-shadow);
            padding: 26px;
            animation: gdpr-rise 420ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .gdpr-header {
            display: grid;
            gap: 8px;
            margin-bottom: 14px;
        }

        .gdpr-eyebrow {
            margin: 0;
            display: inline-flex;
            width: fit-content;
            align-items: center;
            min-height: 24px;
            border-radius: 999px;
            border: 1px solid #abd2e4;
            background: #ecf8ff;
            color: var(--gdpr-700);
            font-size: 11px;
            letter-spacing: 0.08em;
            font-weight: 800;
            text-transform: uppercase;
            padding: 4px 10px;
        }

        .gdpr-title {
            margin: 0;
            font: 700 clamp(1.5rem, 1.1rem + 1.1vw, 2.05rem) / 1.12 var(--gdpr-title-font);
            letter-spacing: -0.02em;
            color: var(--gdpr-900);
        }

        .gdpr-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px 12px;
            align-items: center;
            color: var(--gdpr-text-secondary);
            font-size: 14px;
        }

        .gdpr-meta-note {
            display: inline-flex;
            align-items: center;
            min-height: 28px;
            padding: 4px 10px;
            border-radius: 999px;
            border: 1px solid #c7ddea;
            background: linear-gradient(180deg, #ffffff 0%, #f2f8fc 100%);
            color: #355d72;
            font-size: 12px;
            font-weight: 700;
        }

        .gdpr-intro {
            margin: 2px 0 0;
            color: var(--gdpr-text-secondary);
            font-size: 14px;
            line-height: 1.55;
            max-width: 72ch;
        }

        .gdpr-site-badge {
            display: inline-flex;
            align-items: center;
            min-height: 30px;
            padding: 4px 10px;
            border-radius: 999px;
            border: 1px solid #cae3f0;
            background: #f5fbff;
            color: #2f5d70;
            font-size: 12px;
            font-weight: 700;
        }

        .gdpr-language-wrap {
            margin-bottom: 16px;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 10px;
        }

        .gdpr-language-label {
            color: var(--gdpr-text-secondary);
            font-size: 13px;
            font-weight: 600;
        }

        .gdpr-language-nav {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            padding: 4px;
            border: 1px solid var(--gdpr-border-subtle);
            background: linear-gradient(180deg, #ffffff 0%, #f4faff 100%);
            gap: 4px;
        }

        .gdpr-language-nav a {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 44px;
            min-height: 36px;
            padding: 0 12px;
            border-radius: 999px;
            color: var(--gdpr-text-secondary);
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-decoration: none;
            transition: background-color 140ms ease, color 140ms ease, transform 140ms ease;
        }

        .gdpr-language-nav a:hover {
            background: var(--gdpr-bg-subtle);
            color: var(--gdpr-text-primary);
            transform: translateY(-1px);
        }

        .gdpr-language-nav a:focus-visible {
            outline: none;
            box-shadow: var(--gdpr-focus-ring);
        }

        .gdpr-language-nav a[aria-current="page"] {
            background: linear-gradient(180deg, #e8f6fd 0%, #dff0fa 100%);
            color: var(--gdpr-800);
        }

        .gdpr-alert {
            border: 1px solid var(--gdpr-border-subtle);
            border-radius: var(--gdpr-radius-md);
            padding: 12px 14px;
            margin-bottom: 16px;
            box-shadow: 0 6px 16px rgba(12, 61, 89, 0.08);
        }

        .gdpr-alert p {
            margin: 0;
            font-size: 14px;
        }

        .gdpr-alert--info {
            border-color: #c9e0ec;
            background: linear-gradient(180deg, #f7fcff 0%, #eef7fd 100%);
            color: #2f5f79;
        }

        .gdpr-alert--success {
            border-color: rgba(17, 109, 61, 0.24);
            background: var(--gdpr-success-soft);
            color: var(--gdpr-success-strong);
        }

        .gdpr-alert--warning {
            border-color: #e7ca95;
            background: var(--gdpr-warning-soft);
            color: var(--gdpr-warning-strong);
        }

        .gdpr-notice {
            margin: 0;
            border: 1px solid var(--gdpr-border-subtle);
            border-radius: var(--gdpr-radius-md);
            background: linear-gradient(180deg, #ffffff 0%, #f9fdff 100%);
            box-shadow: 0 8px 20px rgba(0, 66, 91, 0.09);
            overflow: hidden;
        }

        .gdpr-notice-title {
            margin: 0;
            padding: 14px 16px;
            border-bottom: 1px solid var(--gdpr-border-subtle);
            font-size: 14px;
            font-weight: 700;
            color: var(--gdpr-900);
            background: linear-gradient(180deg, #f9fdff 0%, #f1f8fd 100%);
        }

        .gdpr-notice-body {
            padding: 14px 16px;
            font-size: 14px;
            color: var(--gdpr-text-primary);
            max-height: 310px;
            overflow: auto;
            overflow-wrap: anywhere;
            line-height: 1.65;
        }

        .gdpr-form {
            margin-top: 18px;
        }

        .gdpr-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .gdpr-btn {
            min-height: 40px;
            border-radius: var(--gdpr-radius-sm);
            border: 1px solid transparent;
            padding: 9px 16px;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.01em;
            cursor: pointer;
            transition: transform 150ms ease, box-shadow 150ms ease, background-color 140ms ease, border-color 140ms ease, color 140ms ease;
        }

        .gdpr-btn:focus-visible {
            outline: none;
            box-shadow: var(--gdpr-focus-ring);
        }

        .gdpr-btn:active {
            transform: translateY(0);
        }

        .gdpr-btn--accept {
            background: linear-gradient(165deg, var(--gdpr-600) 0%, var(--gdpr-700) 100%);
            color: #ffffff;
            border-color: transparent;
            box-shadow: 0 6px 14px rgba(0, 109, 144, 0.22);
        }

        .gdpr-btn--accept:hover {
            background: linear-gradient(165deg, var(--gdpr-700) 0%, var(--gdpr-900) 100%);
            box-shadow: 0 10px 20px rgba(0, 109, 144, 0.26);
            transform: translateY(-1px);
        }

        .gdpr-btn--decline {
            background: linear-gradient(180deg, #ffffff 0%, #f0f8fd 100%);
            color: var(--gdpr-700);
            border-color: var(--gdpr-border-strong);
            box-shadow: none;
        }

        .gdpr-btn--decline:hover {
            background: linear-gradient(180deg, #ffffff 0%, #e8f4fb 100%);
            border-color: #86b3c7;
            color: var(--gdpr-900);
            transform: translateY(-1px);
        }

        .gdpr-footnote {
            margin: 14px 0 0;
            color: var(--gdpr-text-muted);
            font-size: 13px;
        }

        @keyframes gdpr-rise {
            from {
                opacity: 0;
                transform: translateY(10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 640px) {
            .gdpr-page {
                padding: 12px;
            }

            .gdpr-shell {
                padding: 16px;
                border-radius: 16px;
            }

            .gdpr-actions {
                flex-direction: column;
            }

            .gdpr-btn {
                width: 100%;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
                scroll-behavior: auto !important;
            }
        }
    </style>
</head>
<body>
    <main class="gdpr-page">
        <article class="gdpr-shell" role="region" aria-labelledby="gdpr-title">
            <header class="gdpr-header">
                <p class="gdpr-eyebrow"><?php echo htmlspecialchars($eyebrow); ?></p>
                <h1 id="gdpr-title" class="gdpr-title"><?php $this->_($this->title); ?></h1>
                <div class="gdpr-meta">
                    <?php if (!empty($this->siteName)): ?>
                        <span class="gdpr-site-badge"><?php $this->_($this->siteName); ?></span>
                    <?php endif; ?>
                    <span class="gdpr-meta-note"><?php echo htmlspecialchars($securePublicLink); ?></span>
                </div>
                <p class="gdpr-intro"><?php echo htmlspecialchars($intro); ?></p>
            </header>

            <?php if (!empty($this->token)): ?>
                <section class="gdpr-language-wrap" aria-label="Language switcher">
                    <span class="gdpr-language-label"><?php echo htmlspecialchars($languageLabel); ?></span>
                    <nav class="gdpr-language-nav" aria-label="<?php echo htmlspecialchars($languageNavLabel); ?>">
                        <a href="<?php echo htmlspecialchars($formAction); ?>?t=<?php echo($tokenParam); ?>&amp;lang=ro" <?php echo($currentLang === 'ro' ? 'aria-current="page"' : ''); ?>>RO</a>
                        <a href="<?php echo htmlspecialchars($formAction); ?>?t=<?php echo($tokenParam); ?>&amp;lang=en" <?php echo($currentLang === 'en' ? 'aria-current="page"' : ''); ?>>EN</a>
                        <a href="<?php echo htmlspecialchars($formAction); ?>?t=<?php echo($tokenParam); ?>&amp;lang=fr" <?php echo($currentLang === 'fr' ? 'aria-current="page"' : ''); ?>>FR</a>
                    </nav>
                </section>
            <?php endif; ?>

            <?php if (!empty($this->message)): ?>
                <section class="gdpr-alert gdpr-alert--<?php echo htmlspecialchars($messageTone); ?>" role="<?php echo($isAlert ? 'alert' : 'status'); ?>" aria-live="<?php echo($isAlert ? 'assertive' : 'polite'); ?>">
                    <p><?php $this->_($this->message); ?></p>
                </section>
            <?php endif; ?>

            <?php if (!empty($this->showForm)): ?>
                <?php $hasNoticeTitle = !empty($this->noticeTitle); ?>
                <section class="gdpr-notice" <?php echo($hasNoticeTitle ? 'aria-labelledby="gdpr-notice-title"' : 'aria-label="Consent notice"'); ?>>
                    <?php if (!empty($this->noticeTitle)): ?>
                        <h2 id="gdpr-notice-title" class="gdpr-notice-title"><?php $this->_($this->noticeTitle); ?></h2>
                    <?php endif; ?>
                    <?php if (!empty($this->noticeBody)): ?>
                        <div class="gdpr-notice-body">
                            <?php echo nl2br(htmlspecialchars($this->noticeBody)); ?>
                        </div>
                    <?php endif; ?>
                </section>

                <form class="gdpr-form" method="post" action="<?php echo htmlspecialchars($formAction); ?>" aria-describedby="gdpr-security-note">
                    <input type="hidden" name="t" value="<?php $this->_($this->token); ?>" />
                    <input type="hidden" name="lang" value="<?php echo htmlspecialchars($currentLang); ?>" />
                    <input type="hidden" name="noticeVersion" value="<?php echo(isset($this->noticeVersion) ? htmlspecialchars($this->noticeVersion) : ''); ?>" />
                    <div class="gdpr-actions">
                        <button type="submit" name="action" value="accept" class="gdpr-btn gdpr-btn--accept"><?php echo htmlspecialchars($acceptButton); ?></button>
                        <button type="submit" name="action" value="decline" class="gdpr-btn gdpr-btn--decline"><?php echo htmlspecialchars($declineButton); ?></button>
                    </div>
                </form>
                <p class="gdpr-footnote" id="gdpr-security-note"><?php echo htmlspecialchars($footnote); ?></p>
            <?php endif; ?>
        </article>
    </main>
</body>
</html>
