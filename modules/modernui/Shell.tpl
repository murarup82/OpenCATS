<?php TemplateUtility::printHeader('Modern UI Preview', array('public/modern-ui/modern-shell.css', 'public/modern-ui/modern-app.css', 'public/modern-ui/modern-shell.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs(null, '', $this->targetModule); ?>

<div id="main">
    <?php TemplateUtility::printQuickSearch(); ?>
    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
        <div class="modern-shell-layout">
            <div class="modern-shell-hero">
                <div class="modern-shell-hero-main">
                    <div class="modern-shell-label-row">
                        <div class="modern-shell-label">Modern UI Preview</div>
                        <span class="modern-shell-pill modern-shell-pill--mode">Hybrid mode</span>
                    </div>
                    <h2 class="modern-shell-hero-title">
                        <span class="modern-shell-route-module"><?php $this->_($this->targetModule); ?></span>
                        <?php if ($this->targetAction !== ''): ?>
                            <span class="modern-shell-route-sep">/</span>
                            <span class="modern-shell-route-action"><?php $this->_($this->targetAction); ?></span>
                        <?php endif; ?>
                    </h2>
                    <p class="modern-shell-hero-copy">
                        Progressive migration shell with legacy-safe fallback. Same session, same permissions, modern presentation.
                    </p>
                    <div class="modern-shell-trust-bar">
                        <span class="modern-shell-pill">Auth: shared session</span>
                        <span class="modern-shell-pill">Fallback: 1 click</span>
                        <span class="modern-shell-pill">Safety: route scoped</span>
                    </div>
                </div>
                <div class="modern-shell-hero-actions">
                    <a class="button ui2-button ui2-button--secondary modern-shell-action modern-shell-action--secondary" href="<?php $this->_($this->legacyURL); ?>">
                        Use Legacy UI
                    </a>
                    <a class="button ui2-button ui2-button--primary modern-shell-action modern-shell-action--primary" href="<?php $this->_($this->modernURL); ?>">
                        Keep Modern UI
                    </a>
                </div>
            </div>

            <div
                id="modernAppRoot"
                class="modern-shell-app-root"
                data-bootstrap="<?php echo(htmlspecialchars($this->bootstrapPayload, ENT_QUOTES, 'UTF-8')); ?>"
                data-bundle-url="<?php echo(htmlspecialchars($this->bundleURL, ENT_QUOTES, 'UTF-8')); ?>"
                data-dev-server-url="<?php echo(htmlspecialchars($this->devServerURL, ENT_QUOTES, 'UTF-8')); ?>"
                data-client-logging="<?php echo($this->clientLoggingEnabled ? '1' : '0'); ?>"
                data-auto-legacy-fallback-seconds="<?php echo((int) $this->autoLegacyFallbackSeconds); ?>"
            >
                <div class="modern-shell-loading">
                    <span class="modern-shell-loading-dot"></span>
                    <span>Loading modern UI...</span>
                </div>
            </div>
        </div>
    </div>
</div>

<?php TemplateUtility::printFooter(); ?>
