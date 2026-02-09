<?php /* $Id: Login.tpl 3530 2007-11-09 18:28:10Z brian $ */ ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        <title>opencats - Login</title>
        <meta http-equiv="Content-Type" content="text/html; charset=<?php echo(HTML_ENCODING); ?>" />
        <style type="text/css" media="all">@import "modules/login/login.css";</style>
        <style type="text/css" media="all">@import "public/css/ui2.css";</style>
        <style type="text/css" media="all">@import "public/css/ui2-theme-avel.css";</style>
        <script type="text/javascript" src="js/lib.js"></script>
        <script type="text/javascript" src="modules/login/validator.js"></script>
        <script type="text/javascript" src="js/submodal/subModal.js"></script>
    </head>

    <body class="ui2-body">
    <!-- CATS_LOGIN -->
    <?php TemplateUtility::printPopupContainer(); ?>
<!--       <div id="headerBlock">
            <span id="mainLogo">opencats</span><br />
             <span id="subMainLogo">Applicant Tracking System</span>
       </div> -->

        <div class="ui2 ui2-login ui2-theme-avel">
            <div class="ui2-login-card">
                <div class="ui2-login-brand">
                    <img src="/public/images/avel-logo.png" alt="Avel Technologies" class="ui2-login-logo" />
                    <div class="ui2-login-title">Avel Technologies ATS</div>
                </div>

                <?php if (!empty($this->message)): ?>
                    <div>
                        <?php if ($this->messageSuccess): ?>
                            <p class="success"><?php $this->_($this->message); ?><br /></p>
                        <?php else: ?>
                            <p class="failure ui2-login-error"><?php $this->_($this->message); ?><br /></p>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <div id="contents">
                    <div id="login">
                        <div id="loginText">
                            <div class="ctr">
                            </div>
                            <br />

                            <?php if (ENABLE_DEMO_MODE && !($this->siteName != '' && $this->siteName != 'choose') || ($this->siteName == 'demo')): ?>
                                <br /><br />
                                <a href="javascript:void(0);" onclick="demoLogin(); return false;">Login to Demo Account</a><br />
                            <?php endif; ?>
                        </div>

                        <div id="formBlock">
                            <form name="loginForm" id="loginForm" action="<?php echo(CATSUtility::getIndexName()); ?>?m=login&amp;a=attemptLogin<?php if ($this->reloginVars != ''): ?>&amp;reloginVars=<?php echo($this->reloginVars); ?><?php endif; ?>" method="post" onsubmit="return checkLoginForm(document.loginForm);" autocomplete="off">
                                <div id="subFormBlock">
                                    <?php if ($this->siteName != '' && $this->siteName != 'choose'): ?>
                                        <?php if ($this->siteNameFull == 'error'): ?>
                                            <label>This site does not exist. Please check the URL and try again.</label>
                                            <br />
                                            <br />
                                        <?php else: ?>
                                            <label><?php $this->_($this->siteNameFull); ?></label>
                                            <br />
                                            <br />
                                        <?php endif; ?>
                                    <?php endif; ?>

                                    <?php if ($this->siteNameFull != 'error'): ?>
                                        <label id="usernameLabel" for="username">Username</label><br />
                                        <input name="username" id="username" class="login-input-box ui2-input" value="<?php if (isset($this->username)) $this->_($this->username); ?>" />
                                        <br />

                                        <label id="passwordLabel" for="password">Password</label><br />
                                        <input type="password" name="password" id="password" class="login-input-box ui2-input" />
                                        <br />

                                        <input type="submit" class="button ui2-btn ui2-btn-primary" value="Login" />
                                        <input type="reset"  id="reset" name="reset" class="button ui2-btn ui2-btn-secondary" value="Reset" />
                                    <?php else: ?>
                                        <br />
                                        <a href="javascript:void(0);" onclick="demoLogin(); return false;">Login to Demo Account</a><br />
                                    <?php endif; ?>
                                    <br /><br />
                                </div>
                            </form>

                            <span class="version">Version <?php echo(CATSUtility::getVersion()); ?></span>
                        </div>
                        <div style="clear: both;"></div>
                    </div>
                </div>
            </div>

            <div class="ui2-login-footer">
                <span><a href="http://forums.opencats.org ">opencats support forum</a></span>
                <div id="footerBlock">
                    <span class="footerCopyright"><?php echo(COPYRIGHT_HTML); ?></span>
                    Based upon original work and Powered by <a href="http://www.opencats.org" target="_blank">OpenCATS</a>.
                </div>
            </div>
        </div>

        <script type="text/javascript">
            <?php if ($this->siteNameFull != 'error'): ?>
                document.loginForm.username.focus();

                function demoLogin()
                {
                    document.getElementById('username').value = '<?php echo(DEMO_LOGIN); ?>';
                    document.getElementById('password').value = '<?php echo(DEMO_PASSWORD); ?>';
                    document.getElementById('loginForm').submit();
                }
                function defaultLogin()
                {
                    document.getElementById('username').value = 'admin';
                    document.getElementById('password').value = 'cats';
                    document.getElementById('loginForm').submit();
                }
            <?php endif; ?>
            <?php if (isset($_GET['defaultlogin'])): ?>
                defaultLogin();
            <?php endif; ?>
        </script>

        <script type="text/javascript">
            initPopUp();
        </script>
        <?php TemplateUtility::printCookieTester(); ?>
    </body>
</html>

