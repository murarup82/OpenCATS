<?php /* GDPR Consent Public Page */ ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?php $this->_($this->title); ?></title>
    <style>
        body { margin: 0; padding: 0; font: 14px/1.5 Arial, sans-serif; background: #f4f6f8; color: #1f2933; }
        .gdpr-container { max-width: 720px; margin: 40px auto; background: #fff; border: 1px solid #e3e7ea; border-radius: 6px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        h1 { font-size: 20px; margin: 0 0 8px 0; }
        .gdpr-site { color: #4c5a61; font-size: 13px; margin-bottom: 16px; }
        .gdpr-message { background: #f8fafc; border-left: 3px solid #0097bd; padding: 10px 12px; margin: 12px 0; }
        .gdpr-notice { margin: 16px 0; color: #333; }
        .gdpr-actions { display: flex; gap: 10px; margin-top: 16px; }
        .gdpr-actions button { padding: 8px 14px; font-size: 14px; border-radius: 4px; border: 1px solid #00425b; cursor: pointer; }
        .gdpr-actions .primary { background: #00425b; color: #fff; }
        .gdpr-actions .secondary { background: #fff; color: #00425b; }
        .gdpr-footer { margin-top: 18px; font-size: 12px; color: #6b7c87; }
    </style>
</head>
<body>
    <div class="gdpr-container">
        <h1><?php $this->_($this->title); ?></h1>
        <?php if (!empty($this->siteName)): ?>
            <div class="gdpr-site"><?php $this->_($this->siteName); ?></div>
        <?php endif; ?>

        <?php if (!empty($this->message)): ?>
            <div class="gdpr-message"><?php $this->_($this->message); ?></div>
        <?php endif; ?>

        <?php if (!empty($this->showForm)): ?>
            <div class="gdpr-notice">
                By clicking “Accept”, you consent to the processing and storage of your personal data for recruitment purposes.
                You may decline if you do not wish your data to be stored.
            </div>
            <form method="post" action="consent.php">
                <input type="hidden" name="t" value="<?php $this->_($this->token); ?>" />
                <div class="gdpr-actions">
                    <button type="submit" name="action" value="accept" class="primary">Accept</button>
                    <button type="submit" name="action" value="decline" class="secondary">Decline</button>
                </div>
            </form>
            <div class="gdpr-footer">
                This request is secure and will expire automatically if not acted upon.
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
