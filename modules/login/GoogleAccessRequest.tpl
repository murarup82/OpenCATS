<?php /* Google access request */ ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
    <head>
        <title>OpenCATS - Request Access</title>
        <meta http-equiv="Content-Type" content="text/html; charset=<?php echo(HTML_ENCODING); ?>" />
        <style type="text/css" media="all">@import "modules/login/login.css";</style>
        <style type="text/css" media="all">@import "public/css/ui2.css";</style>
        <style type="text/css" media="all">@import "public/css/ui2-theme-avel.css";</style>
    </head>
    <body class="ui2-body">
        <div class="ui2 ui2-login ui2-theme-avel">
            <div class="ui2-login-card">
                <div class="ui2-login-brand">
                    <img src="/public/images/avel-logo.png" alt="Avel Technologies" class="ui2-login-logo" />
                    <div class="ui2-login-title">Access Request</div>
                </div>

                <?php if ($this->status !== 'form'): ?>
                    <?php if ($this->status === 'submitted'): ?>
                        <p class="success"><?php $this->_($this->statusMessage); ?></p>
                    <?php else: ?>
                        <p class="failure"><?php $this->_($this->statusMessage); ?></p>
                    <?php endif; ?>
                    <p style="margin-top: 12px;">
                        <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=login">Back to Login</a>
                    </p>
                <?php else: ?>
                    <p>
                        Your Google account is not active in OpenCATS yet.
                        Submit this form to request access.
                    </p>

                    <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=login&amp;a=requestAccess" method="post">
                        <label for="fullName">Name</label><br />
                        <input id="fullName" type="text" class="login-input-box ui2-input" value="<?php $this->_($this->fullName); ?>" readonly="readonly" />
                        <br />

                        <label for="email">Email</label><br />
                        <input id="email" type="text" class="login-input-box ui2-input" value="<?php $this->_($this->email); ?>" readonly="readonly" />
                        <br />

                        <label for="reason">Reason (optional)</label><br />
                        <textarea id="reason" name="reason" rows="4" cols="40" class="ui2-input"><?php $this->_($this->reason); ?></textarea>
                        <br /><br />

                        <input type="submit" class="button ui2-btn ui2-btn-primary" value="Request Access" />
                    </form>
                <?php endif; ?>
            </div>
        </div>
    </body>
</html>
