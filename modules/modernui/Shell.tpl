<?php TemplateUtility::printHeader('Modern UI Preview', array('public/modern-ui/modern-shell.css', 'public/modern-ui/modern-app.css', 'public/modern-ui/modern-shell.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs(null, '', $this->targetModule); ?>

<div id="main">
    <?php TemplateUtility::printQuickSearch(); ?>
    <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
        <div class="modern-shell-layout">
            <div class="modern-shell-hero">
                <div class="modern-shell-hero-main">
                    <div class="modern-shell-label">Modern UI Preview</div>
                    <h2>
                        <?php $this->_($this->targetModule); ?>
                        <?php if ($this->targetAction !== ''): ?>
                            <span class="modern-shell-route-sep">/</span>
                            <?php $this->_($this->targetAction); ?>
                        <?php endif; ?>
                    </h2>
                    <p>
                        This route is served by the modern shell. You can switch back to legacy instantly.
                    </p>
                </div>
                <div class="modern-shell-hero-actions">
                    <a class="button ui2-button ui2-button--secondary" href="<?php $this->_($this->legacyURL); ?>">
                        Use Legacy UI
                    </a>
                    <a class="button ui2-button ui2-button--primary" href="<?php $this->_($this->modernURL); ?>">
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
