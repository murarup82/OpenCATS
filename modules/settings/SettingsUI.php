<?php
/*
 * CATS
 * Settings Module
 *
 * Copyright (C) 2005 - 2007 Cognizo Technologies, Inc.
 *
 *
 * The contents of this file are subject to the CATS Public License
 * Version 1.1a (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.catsone.com/.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied. See the
 * License for the specific language governing rights and limitations
 * under the License.
 *
 * The Original Code is "CATS Standard Edition".
 *
 * The Initial Developer of the Original Code is Cognizo Technologies, Inc.
 * Portions created by the Initial Developer are Copyright (C) 2005 - 2007
 * (or from the year in which this file was created to the year 2007) by
 * Cognizo Technologies, Inc. All Rights Reserved.
 *
 *
 * $Id: SettingsUI.php 3810 2007-12-05 19:13:25Z brian $opencats
 */

include_once(LEGACY_ROOT . '/lib/LoginActivity.php');
include_once(LEGACY_ROOT . '/lib/NewVersionCheck.php');
include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/Companies.php');
include_once(LEGACY_ROOT . '/lib/Contacts.php');
include_once(LEGACY_ROOT . '/lib/Graphs.php');
include_once(LEGACY_ROOT . '/lib/Site.php');
include_once(LEGACY_ROOT . '/lib/ListEditor.php');
include_once(LEGACY_ROOT . '/lib/SystemUtility.php');
include_once(LEGACY_ROOT . '/lib/Mailer.php');
include_once(LEGACY_ROOT . '/lib/EmailTemplates.php');
include_once(LEGACY_ROOT . '/lib/License.php');
include_once(LEGACY_ROOT . '/lib/History.php');
include_once(LEGACY_ROOT . '/lib/Pipelines.php');
include_once(LEGACY_ROOT . '/lib/CareerPortal.php');
include_once(LEGACY_ROOT . '/lib/WebForm.php');
include_once(LEGACY_ROOT . '/lib/CommonErrors.php');
include_once(LEGACY_ROOT . '/lib/ImportUtility.php');
include_once(LEGACY_ROOT . '/lib/Questionnaire.php');
include_once(LEGACY_ROOT . '/lib/Tags.php');
include_once(LEGACY_ROOT . '/lib/GDPRSettings.php');
include_once(LEGACY_ROOT . '/lib/FeedbackSettings.php');
include_once(LEGACY_ROOT . '/lib/ReportsSettings.php');
include_once(LEGACY_ROOT . '/lib/StringUtility.php');
include_once(LEGACY_ROOT . '/lib/TalentFitFlowSettings.php');
include_once(LEGACY_ROOT . '/lib/TalentFitFlowClient.php');
include_once(LEGACY_ROOT . '/lib/GoogleOIDCSettings.php');
include_once(LEGACY_ROOT . '/lib/UserRoles.php');
include_once(LEGACY_ROOT . '/lib/RolePagePermissions.php');
eval(Hooks::get('XML_FEED_SUBMISSION_SETTINGS_HEADERS'));

/* Users.php is included by index.php already. */


class SettingsUI extends UserInterface
{
    /* Maximum number of login history entries to display on User Details. */
    const MAX_RECENT_LOGINS = 15;


    public function __construct()
    {
        parent::__construct();

        $this->_realAccessLevel = $_SESSION['CATS']->getRealAccessLevel();
        $this->_authenticationRequired = true;
        $this->_moduleDirectory = 'settings';
        $this->_moduleName = 'settings';
        $this->_moduleTabText = 'Settings';

        /* Only CATS professional on site gets to make career portal customizer users. */
        if( class_exists('ACL_SETUP') && !empty(ACL_SETUP::$USER_ROLES) )
        {
            $this->_settingsUserCategories = ACL_SETUP::$USER_ROLES;
        }

        $mp = array(
            'Administration' => CATSUtility::getIndexName() . '?m=settings&amp;a=administration',
            'My Profile'     => CATSUtility::getIndexName() . '?m=settings'
        );

        $this->_subTabs = $mp;
        
        $this->_hooks = $this->defineHooks();
    }

    public function defineHooks()
    {
        return array(
            /* Hide all tabs in career portal mode. */
            'TEMPLATE_UTILITY_EVALUATE_TAB_VISIBLE' => '
                if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\'))
                {
                    if (!in_array($moduleName, array(\'settings\')))
                    {
                        $displayTab = false;
                    }
                }
            ',
            
            /* Home goes to settings in career portal mode. */
            'HOME' => '
                if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\'))
                {
                    CATSUtility::transferRelativeURI(\'m=settings\');
                    return false;
                }
            ',
            
            /* My Profile goes to administration in career portal mode. */
            'SETTINGS_DISPLAY_PROFILE_SETTINGS' => '
                if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\'))
                {
                    CATSUtility::transferRelativeURI(\'m=settings&a=administration\');
                    return false;
                }
            ',

            /* Deny access to all modules in career portal mode but settings. */
            'CLIENTS_HANDLE_REQUEST' =>    'if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\')) $this->fatal("' . ERROR_NO_PERMISSION . '");',
            'CONTACTS_HANDLE_REQUEST' =>   'if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\')) $this->fatal("' . ERROR_NO_PERMISSION . '");',
            'CALENDAR_HANDLE_REQUEST' =>   'if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\')) $this->fatal("' . ERROR_NO_PERMISSION . '");',
            'JO_HANDLE_REQUEST' =>         'if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\')) $this->fatal("' . ERROR_NO_PERMISSION . '");',
            'CANDIDATES_HANDLE_REQUEST' => 'if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\')) $this->fatal("' . ERROR_NO_PERMISSION . '");',
            'ACTIVITY_HANDLE_REQUEST' =>   'if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\')) $this->fatal("' . ERROR_NO_PERMISSION . '");',
            'REPORTS_HANDLE_REQUEST' =>    'if ($_SESSION[\'CATS\']->hasUserCategory(\'careerportal\')) $this->fatal("' . ERROR_NO_PERMISSION . '");'
        );
    }
    
    private function onAddNewTag()
    {
        if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
        {
            echo 'CATS has lost your session data!';
            return;
        }
        $tags = new Tags($this->_siteID);
        $arr = $tags->add((isset($_POST['tag_parent_id'])?$_POST['tag_parent_id']:null),$_POST['tag_title'], "-");
        if (isset($_POST['tag_parent_id']))
        {
	        printf('
				<li id="id_li_tag_%d">
					<a href="javascript:;" onclick="doDelete(%d);"><img src="images/actions/delete.gif" /></a>
					<div id="id_tag_%d"><a href="javascript:;" onclick="editTag(%d);">%s</a><div></div></div>
				</li>',
	        $arr['id'],$arr['id'],$arr['id'],$arr['id'],$arr['tag_title']);
        }else
        {
	        printf('
				<li id="id_li_tag_%d">
					<a href="javascript:;" onclick="doDelete(%d);"><img src="images/actions/delete.gif" /></a> %s
					<ul>
						<li>
							<img src="images/actions/add.gif" />
							<form method="post" action="%s?m=settings&amp;a=ajax_tags_add">
								<input type="hidden" name="tag_parent_id" value="%d" />
								<input type="text" name="tag_title" value="" />
								<input type="button" value="Add" onclick="doAdd(this.form);" />
							</form>
						</li>
					</ul>
				</li>',
	        $arr['id'],$arr['id'],$arr['tag_title'], CATSUtility::getIndexName(), $arr['id']);        	
        }
        
        
        return; 
    }
    
    private function onRemoveTag()
    {
        if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
        {
            echo 'CATS has lost your session data!';
            return;
        }
        $tags = new Tags($this->_siteID);
        $tags->delete($_POST['tag_id']);
        return; 
    }
    
    private function onChangeTag()
    {
        if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
        {
            echo 'CATS has lost your session data!';
            return;
        }
        $tags = new Tags($this->_siteID);
        //$tags->update($_POST['tag_id'], $_POST['title'], $_POST['description']);
        $tags->update($_POST['tag_id'], $_POST['tag_title'], "-");
        echo htmlspecialchars($_POST['tag_title'], ENT_QUOTES, 'UTF-8');
        return;
    }
    
    
    /**
     * This function make changes to tags
     * @return unknown_type
     */
    private function onChangeTags()
    {
        // TODO: Add tags changing code
 
    }

    /**
     * Show the tag list
     * @return unknown_type
     */
    private function changeTags()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $tags = new Tags($this->_siteID);
        $tagsRS = $tags->getAll();

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-tags')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernTagsJSON('settings-tags', $tagsRS);
            return;
        }

        //if (!eval(Hooks::get('SETTINGS_EMAIL_TEMPLATES'))) return;

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('tagsRS', $tagsRS);
        $this->_template->display('./modules/settings/tags.tpl');
    }

    public function handleRequest()
    {
        $action = $this->getAction();

        if (!eval(Hooks::get('SETTINGS_HANDLE_REQUEST'))) return;

        switch ($action)
        {
            case 'tags':
                /* Bail out if the user is demo. */
                if ($this->getUserAccessLevel('settings.tags') < ACCESS_LEVEL_SA && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'You are not allowed to edit tags.');
                }
                if ($this->isPostBack())
                {
                    $this->onChangeTags();
                }
                else
                {
                    $this->changeTags();
                }
                break;
            
            case 'changePassword':
                /* Bail out if the user is demo. */
                if ($this->getUserAccessLevel('settings.changePassword') == ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'You are not allowed to change your password.');
                }
                if ($this->isPostBack())
                {
                    $this->onChangePassword();
                }
                break;

            case 'newInstallPassword':
                if ($this->getUserAccessLevel("settings.newInstallPassword") < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onNewInstallPassword();
                }
                else
                {
                    $this->newInstallPassword();
                }
                break;

            case 'forceEmail':
                if ($this->getUserAccessLevel("settings.forceEmail") < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onForceEmail();
                }
                else
                {
                    $this->forceEmail();
                }
                break;

            case 'newSiteName':
                if ($this->getUserAccessLevel('settings.newSiteName') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onNewSiteName();
                }
                else
                {
                    $this->newSiteName();
                }
                break;

            case 'upgradeSiteName':
                if ($this->getUserAccessLevel('settings.upgradeSiteName') < ACCESS_LEVEL_SA)
                {
                    CATSUtility::transferRelativeURI('m=settings&a=newInstallFinished');
                }
                if ($this->isPostBack())
                {
                    $this->onNewSiteName();
                }
                else
                {
                    $this->upgradeSiteName();
                }
                break;

            case 'newInstallFinished':
                if ($this->getUserAccessLevel('settings.newSiteName') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onNewInstallFinished();
                }
                else
                {
                    $this->newInstallFinished();
                }
                break;

            case 'manageUsers':
                if ($this->getUserAccessLevel('settings.manageUsers') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->manageUsers();
                break;

            case 'schemaMigrations':
                if ($this->getUserAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onSchemaMigrations();
                }
                else
                {
                    $this->schemaMigrations();
                }
                break;

            case 'professional':
                if ($this->getUserAccessLevel('settings.professional') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->manageProfessional();
                break;

            case 'previewPage':
                if ($this->getUserAccessLevel('settings.previewPage') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->previewPage();
                break;

            case 'previewPageTop':
                if ($this->getUserAccessLevel('settings.previewPageTop') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->previewPageTop();
                break;

            case 'showUser':
                if ($this->getUserAccessLevel('settings.showUser') < ACCESS_LEVEL_DEMO
                    && $this->_userID != $_GET['userID'])
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->showUser();
                break;

            case 'addUser':
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.addUser.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onAddUser();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.addUser.GET') < ACCESS_LEVEL_DEMO)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->addUser();
                }

                break;

            case 'editUser':

                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.editUser.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onEditUser();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.editUser.GET') < ACCESS_LEVEL_DEMO)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->editUser();
                }

                break;

            case 'createBackup':
                if ($this->getUserAccessLevel('settings.createBackup') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->createBackup();
                break;

            case 'deleteBackup':
                if ($this->getUserAccessLevel('settings.deleteBackup') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->deleteBackup();
                break;

            case 'customizeExtraFields':
                
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.customizeExtraFields.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onCustomizeExtraFields();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.customizeExtraFields.GET') < ACCESS_LEVEL_DEMO)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->customizeExtraFields();
                }
                break;

            case 'customizeCalendar':
                
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.customizeCalendar.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onCustomizeCalendar();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.customizeCalendar.GET') < ACCESS_LEVEL_DEMO)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->customizeCalendar();
                }
                break;

            case 'reports':
                if ($this->getUserAccessLevel('settings.reports') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onReports();
                }
                else
                {
                    $this->reports();
                }
                break;

            case 'emailSettings':
                
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.emailSettings.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onEmailSettings();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.emailSettings.GET') < ACCESS_LEVEL_DEMO)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->emailSettings();
                }
                break;

            case 'careerPortalQuestionnairePreview':
                if ($this->getUserAccessLevel('settings.careerPortalQuestionnairePreview') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->careerPortalQuestionnairePreview();
                break;

            case 'careerPortalQuestionnaire':

                if ($this->getUserAccessLevel('settings.careerPortalQuestionnaire') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onCareerPortalQuestionnaire();
                }
                else
                {
                    $this->careerPortalQuestionnaire();
                }
                break;

            case 'careerPortalQuestionnaireUpdate':
                if ($this->getUserAccessLevel('settings.careerPortalQuestionnaireUpdate') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->careerPortalQuestionnaireUpdate();
                break;

            case 'careerPortalTemplateEdit':
                
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.careerPortalTemplateEdit.POST') < ACCESS_LEVEL_SA && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onCareerPortalTemplateEdit();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.careerPortalTemplateEdit') < ACCESS_LEVEL_DEMO && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->careerPortalTemplateEdit();
                }
                break;

            case 'careerPortalSettings':
                if ($this->getUserAccessLevel('settings.careerPortalSettings') < ACCESS_LEVEL_DEMO && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.careerPortalSettings.POST') < ACCESS_LEVEL_SA && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onCareerPortalSettings();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.careerPortalSettings.GET') < ACCESS_LEVEL_DEMO && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->careerPortalSettings();
                }
                break;

            case 'eeo':
                
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.eeo.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onEEOEOCSettings();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.eeo.GET') < ACCESS_LEVEL_DEMO)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->EEOEOCSettings();
                }
                break;

            case 'gdprSettings':
                if ($this->getUserAccessLevel('settings.gdprSettings') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.gdprSettings.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onGDPRSettings();
                }
                else
                {
                    $this->gdprSettings();
                }
                break;

            case 'feedbackSettings':
                if ($this->getUserAccessLevel('settings.administration') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onFeedbackSettings();
                }
                else
                {
                    $this->feedbackSettings();
                }
                break;

            case 'rejectionReasons':
                if ($this->getUserAccessLevel('settings.rejectionReasons') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.rejectionReasons.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onRejectionReasons();
                }
                else
                {
                    $this->rejectionReasons();
                }
                break;

            case 'talentFitFlowSettings':
                if ($this->getUserAccessLevel('settings.talentFitFlowSettings') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.talentFitFlowSettings.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onTalentFitFlowSettings();
                }
                else
                {
                    $this->talentFitFlowSettings();
                }
                break;

            case 'googleOIDCSettings':
                if ($this->getUserAccessLevel('settings.googleOIDCSettings') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.googleOIDCSettings.POST') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onGoogleOIDCSettings();
                }
                else
                {
                    $this->googleOIDCSettings();
                }
                break;

            case 'rolePagePermissions':
                if ($this->getUserAccessLevel('settings.rolePagePermissions') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onRolePagePermissions();
                }
                else
                {
                    $this->rolePagePermissions();
                }
                break;

            case 'onCareerPortalTweak':
                if ($this->getUserAccessLevel('settings.careerPortalTweak') < ACCESS_LEVEL_SA && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }

                $this->onCareerPortalTweak();
                break;

            /* This really only exists for automated testing at this point. */
            case 'deleteUser':
                if ($this->getUserAccessLevel('settings.deleteUser') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->onDeleteUser();
                break;

            case 'emailTemplates':
                
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.emailTemplates.POST') < ACCESS_LEVEL_SA && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onEmailTemplates();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.emailTemplates.GET') < ACCESS_LEVEL_DEMO && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->emailTemplates();
                }
                break;

           case 'aspLocalization':
                if ($this->getUserAccessLevel('settings.aspLocalization') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                if ($this->isPostBack())
                {
                    $this->onAspLocalization();
                }
                break;

           case 'loginActivity':
                if ($this->getUserAccessLevel('settings.loginActivity') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }

                include_once(LEGACY_ROOT . '/lib/BrowserDetection.php');

                $this->loginActivity();
                break;

            case 'viewItemHistory':
                if ($this->getUserAccessLevel('settings.viewItemHistory') < ACCESS_LEVEL_DEMO)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->viewItemHistory();
                break;

            case 'getFirefoxModal':
                $this->getFirefoxModal();
                break;

            case 'ajax_tags_add':
                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    echo 'CATS has lost your session data!';
                    return;
                }
                $this->onAddNewTag();
                break;
            
            case 'ajax_tags_del':
                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    echo 'CATS has lost your session data!';
                    return;
                }
                $this->onRemoveTag();
                break;

            case 'ajax_tags_upd':
                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    echo 'CATS has lost your session data!';
                    return;
                }
                $this->onChangeTag();
                break;
               
            case 'ajax_wizardAddUser':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.addUser') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have access to add a user.'
                        );
                        return;
                    }
                    echo 'You do not have access to add a user.';
                    return;
                }
                $this->wizard_addUser($isModernJSON);
                break;

            case 'ajax_wizardDeleteUser':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.deleteUser') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have access to delete a user.'
                        );
                        return;
                    }
                    echo 'You do not have access to delete a user.';
                    return;
                }
                $this->wizard_deleteUser($isModernJSON);
                break;

            case 'ajax_wizardCheckKey':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.checkKey') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have access to set the key.'
                        );
                        return;
                    }
                    echo 'You do not have access to set the key.';
                    return;
                }
                $this->wizard_checkKey($isModernJSON);
                break;

            case 'ajax_wizardLocalization':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.localization') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have access to change your localization settings.'
                        );
                        return;
                    }
                    echo 'You do not have access to change your localization settings.';
                    return;
                }
                $this->wizard_localization($isModernJSON);
                break;

            case 'ajax_wizardFirstTimeSetup':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.firstTimeSetup') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not has access to this first-time-setup wizard.'
                        );
                        return;
                    }
                    echo 'You do not has access to this first-time-setup wizard.';
                    return;
                }
                $this->wizard_firstTimeSetup($isModernJSON);
                break;

            case 'ajax_wizardLicense':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.license') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have access to accept the license agreement.'
                        );
                        return;
                    }
                    echo 'You do not have access to accept the license agreement.';
                    return;
                }
                $this->wizard_license($isModernJSON);
                break;

            case 'ajax_wizardPassword':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.password') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have acess to set the site password.'
                        );
                        return;
                    }
                    echo 'You do not have acess to set the site password.';
                    return;
                }
                $this->wizard_password($isModernJSON);
                break;

            case 'ajax_wizardSiteName':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.siteName') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have permission to change the site name.'
                        );
                        return;
                    }
                    echo 'You do not have permission to change the site name.';
                    return;
                }
                $this->wizard_siteName($isModernJSON);
                break;

            case 'ajax_wizardEmail':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.setEmail') < ACCESS_LEVEL_READ)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have permission to set the email.'
                        );
                        return;
                    }
                    echo 'You do not have permission to set the email.';
                    return;
                }
                $this->wizard_email($isModernJSON);
                break;

            case 'ajax_wizardImport':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.import') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have permission to import.'
                        );
                        return;
                    }
                    echo 'You do not have permission to import.';
                    return;
                }
                $this->wizard_import($isModernJSON);
                break;

            case 'ajax_wizardWebsite':
                $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

                if (!isset($_SESSION['CATS']) || empty($_SESSION['CATS']))
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'sessionLost',
                            'CATS has lost your session data!'
                        );
                        return;
                    }
                    echo 'CATS has lost your session data!';
                    return;
                }
                if ($this->getUserAccessLevel('settings.website') < ACCESS_LEVEL_SA)
                {
                    if ($isModernJSON)
                    {
                        $this->respondModernWizardJSON(
                            false,
                            'permissionDenied',
                            'You do not have permission.'
                        );
                        return;
                    }
                    echo 'You do not have permission.';
                    return;
                }
                $this->wizard_website($isModernJSON);
                break;

            case 'administration':
                if ($this->isPostBack())
                {
                    if ($this->getUserAccessLevel('settings.administration.POST') < ACCESS_LEVEL_SA && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->onAdministration();
                }
                else
                {
                    if ($this->getUserAccessLevel('settings.administration.GET') < ACCESS_LEVEL_DEMO && !$_SESSION['CATS']->hasUserCategory('careerportal'))
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                    }
                    $this->administration();
                }
                break;
            
            case 'addEmailTemplate':
                $this->addEmailTemplate();
                break;
                
            case 'deleteEmailTemplate':
                $this->deleteEmailTemplate();
                break;

            /* Main settings page. */
            case 'myProfile':
            default:
                if ($this->getUserAccessLevel('settings.myProfile') < ACCESS_LEVEL_READ)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for action.');
                }
                $this->myProfile();
                break;
        }
    }

    private function deleteEmailTemplate() 
    {
        if ($this->_realAccessLevel < ACCESS_LEVEL_SA)
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this);
            return;
        }

        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $emailTemplates = new EmailTemplates($this->_siteID);
        $templateID = $_GET['id'];
        $emailTemplates->delete($templateID);

        if ($isModernJSON)
        {
            $this->renderModernEmailTemplateMutationJSON(
                'settings.deleteEmailTemplate.mutation.v1',
                true,
                'E-Mail template deleted.'
            );
            return;
        }

        $this->emailTemplates();
    }
    
    private function addEmailTemplate()
    {
        if ($this->_realAccessLevel < ACCESS_LEVEL_SA)
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this);
            return;
        }

        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $possibleVariables = "%CANDSTATUS%%CANDOWNER%%CANDFIRSTNAME%%CANDFULLNAME%%CANDPREVSTATUS%";
        $emailTemplates = new EmailTemplates($this->_siteID);
        $emailTemplateID = $emailTemplates->add("", "New Email Template", "CUSTOM", $this->_siteID, $possibleVariables);
        if($emailTemplateID < 1)
        {
            if ($isModernJSON)
            {
                $this->renderModernEmailTemplateMutationJSON(
                    'settings.addEmailTemplate.mutation.v1',
                    false,
                    'Failed to add template.'
                );
                return;
            }
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to add template.');
        }
        else
        {
            if ($isModernJSON)
            {
                $this->renderModernEmailTemplateMutationJSON(
                    'settings.addEmailTemplate.mutation.v1',
                    true,
                    'E-Mail template added.'
                );
                return;
            }
            $this->emailTemplates();
        }
    }
    
    /*
     * Called by handleRequest() to process loading the get firefox modal dialog.
     */
    private function getFirefoxModal()
    {
        $this->_template->display(
            './modules/settings/getFirefoxModal.tpl'
        );
    }

    /*
     * Called by handleRequest() to process loading the my profile page.
     */
    private function myProfile()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $requestedSubpage = strtolower($this->getTrimmedInput('s', $_GET));
        $isDemoUser = $_SESSION['CATS']->isDemo();

        if ($responseFormat === 'modern-json')
        {
            if ($requestedSubpage === '')
            {
                if ($modernPage !== '' && $modernPage !== 'settings-myprofile')
                {
                    if (!headers_sent())
                    {
                        header('HTTP/1.1 400 Bad Request');
                        header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                    }
                    echo json_encode(array(
                        'error' => true,
                        'message' => 'Unsupported modern page contract.',
                        'requestedPage' => $modernPage
                    ));
                    return;
                }

                $this->renderModernMyProfileJSON('settings-myprofile');
                return;
            }

            if ($requestedSubpage === 'changepassword')
            {
                if ($modernPage !== '' && $modernPage !== 'settings-myprofile-change-password')
                {
                    if (!headers_sent())
                    {
                        header('HTTP/1.1 400 Bad Request');
                        header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                    }
                    echo json_encode(array(
                        'error' => true,
                        'message' => 'Unsupported modern page contract.',
                        'requestedPage' => $modernPage
                    ));
                    return;
                }

                $this->renderModernMyProfileChangePasswordJSON('settings-myprofile-change-password');
                return;
            }
        }

        if (isset($_GET['s']))
        {
            switch($_GET['s'])
            {
                case 'changePassword':
                    $templateFile = './modules/settings/ChangePassword.tpl';
                    break;

                default:
                    $templateFile = './modules/settings/MyProfile.tpl';
                    break;
            }
        }
        else
        {
            $templateFile = './modules/settings/MyProfile.tpl';
        }

        if (!eval(Hooks::get('SETTINGS_DISPLAY_PROFILE_SETTINGS'))) return;

        $this->_template->assign('isDemoUser', $isDemoUser);
        $this->_template->assign('userID', $this->_userID);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'My Profile');
        $this->_template->assign('auth_mode', AUTH_MODE);
        $this->_template->display($templateFile);
    }

    /*
     * Called by handleRequest() to process loading the user details page.
     */
    private function showUser()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        // FIXME: Does $_GET['userID'] exist?
        if (isset($_GET['privledged']) &&  $_GET['privledged'] == 'false' &&
            $this->_userID == $_GET['userID'])
        {
            $privledged = false;
        }
        else
        {
            $privledged = true;
        }

        $userID = $_GET['userID'];

        $users = new Users($this->_siteID);
        $data = $users->get($userID);

        if (empty($data))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'No user found with selected ID.');
        }

        $data['successfulDate'] = DateUtility::fixZeroDate(
            $data['successfulDate'], 'Never'
        );

        $data['unsuccessfulDate'] = DateUtility::fixZeroDate(
            $data['unsuccessfulDate'], 'Never'
        );

        $accessLevels = $users->getAccessLevels();

        $loginAttempts = $users->getLastLoginAttempts(
            $userID, self::MAX_RECENT_LOGINS
        );

        if (!empty($loginAttempts))
        {
            foreach ($loginAttempts as $rowIndex => $row)
            {
                $loginAttempts[$rowIndex]['shortUserAgent'] = implode(
                    ' ', BrowserDetection::detect($loginAttempts[$rowIndex]['userAgent'])
                );

                if ($loginAttempts[$rowIndex]['successful'] == 0)
                {
                    $loginAttempts[$rowIndex]['successful'] = 'No';
                }
                else
                {
                    $loginAttempts[$rowIndex]['successful'] = 'Yes';
                }
            }
        }

        $siteIDPosition = strpos($data['username'], '@' . $_SESSION['CATS']->getSiteID());

        // FIXME: The last test here might be redundant.
        if ($siteIDPosition !== false &&
            substr($data['username'], $siteIDPosition) == '@' . $_SESSION['CATS']->getSiteID())
        {
           $data['username'] = str_replace(
               '@' . $_SESSION['CATS']->getSiteID(), '', $data['username']
           );
        }

        /* Get user categories, if any. */
        $modules = ModuleUtility::getModules();
        $categories = array();
        foreach ($modules as $moduleName => $parameters)
        {
            $moduleCategories = $parameters[MODULE_SETTINGS_USER_CATEGORIES];

            if ($moduleCategories != false)
            {
                foreach ($moduleCategories as $category)
                {
                    $categories[] = $category;
                }
            }
        }

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        $userRoles = new UserRoles($this->_siteID);
        $applicationRole = $userRoles->getForUser($userID);
        if (empty($applicationRole))
        {
            $applicationRole = array(
                'roleName' => '',
                'roleKey' => '',
                'accessLevel' => ''
            );
        }

        $this->_template->assign('privledged', $privledged);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', '');
        $this->_template->assign('data', $data);
        $this->_template->assign('categories', $categories);
        $this->_template->assign('accessLevels', $accessLevels);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('userRolesEnabled', $userRoles->isSchemaAvailable() ? 1 : 0);
        $this->_template->assign('applicationRole', $applicationRole);
        $this->_template->assign('currentUser', $this->_userID);
        $this->_template->assign('loginDisplay', self::MAX_RECENT_LOGINS);
        $this->_template->assign('loginAttempts', $loginAttempts);

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-show-user')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernShowUserJSON(
                'settings-show-user',
                $privledged,
                $data,
                $categories,
                $EEOSettingsRS,
                $userRoles->isSchemaAvailable() ? 1 : 0,
                $applicationRole,
                $loginAttempts
            );
            return;
        }

        $this->_template->display('./modules/settings/ShowUser.tpl');
    }

    /*
     * Called by handleRequest() to process loading the user add page.
     */
    private function addUser()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $users = new Users($this->_siteID);
        $accessLevels = $users->getAccessLevels();

        $rs = $users->getAll();
        $license = $users->getLicenseData();

        /* Get user categories, if any. */
        $modules = ModuleUtility::getModules();
        $categories = array();
        foreach ($modules as $moduleName => $parameters)
        {
            $moduleCategories = $parameters[MODULE_SETTINGS_USER_CATEGORIES];

            if ($moduleCategories != false)
            {
                foreach ($moduleCategories as $category)
                {
                    /* index 3 is the user level required to assign this type of category. */
                    if (!isset($category[3]) || $category[3] <= $this->_realAccessLevel)
                    {
                        $categories[] = $category;
                    }
                }
            }
        }

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        $userRoles = new UserRoles($this->_siteID);
        $userRolesRS = $userRoles->getAll();
        $defaultUserRoleID = 0;
        if (!empty($userRolesRS))
        {
            $defaultUserRole = $userRoles->getDefaultRoleByAccessLevel(ACCESS_LEVEL_DELETE);
            if (empty($defaultUserRole))
            {
                $defaultUserRole = $userRolesRS[0];
            }
            $defaultUserRoleID = (int) $defaultUserRole['roleID'];
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', '');
        $this->_template->assign('accessLevels', $accessLevels);
        $this->_template->assign('license', $license);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('defaultAccessLevel', ACCESS_LEVEL_DELETE);
        $this->_template->assign('currentUser', $this->_userID);
        $this->_template->assign('categories', $categories);
        $this->_template->assign('userRolesEnabled', $userRoles->isSchemaAvailable() ? 1 : 0);
        $this->_template->assign('userRoles', $userRolesRS);
        $this->_template->assign('defaultUserRoleID', $defaultUserRoleID);
        $this->_template->assign('auth_mode', AUTH_MODE);

        if (!eval(Hooks::get('SETTINGS_ADD_USER'))) return;

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-add-user')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernAddUserJSON(
                'settings-add-user',
                $accessLevels,
                $license,
                $categories,
                $EEOSettingsRS,
                $userRoles->isSchemaAvailable() ? 1 : 0,
                $userRolesRS,
                $defaultUserRoleID
            );
            return;
        }

        $this->_template->display('./modules/settings/AddUser.tpl');
    }

    /*
     * Called by handleRequest() to process adding a user.
     */
    private function onAddUser()
    {
        if (AUTH_MODE == "ldap")
        {
            /* LDAP users are not allowed to be created in DB manualy */
            return;
        }

        $firstName      = $this->getSanitisedInput('firstName', $_POST);
        $lastName       = $this->getSanitisedInput('lastName', $_POST);
        $email          = $this->getSanitisedInput('email', $_POST);
        $username       = $this->getSanitisedInput('username', $_POST);
        $accessLevel    = $this->getTrimmedInput('accessLevel', $_POST);
        $password       = $this->getTrimmedInput('password', $_POST);
        $retypePassword = $this->getTrimmedInput('retypePassword', $_POST);
        $role           = $this->getTrimmedInput('role', $_POST);
        $roleID         = (int) $this->getTrimmedInput('roleID', $_POST);
        $eeoIsVisible   = $this->isChecked('eeoIsVisible', $_POST);

        $users = new Users($this->_siteID);
        $userRoles = new UserRoles($this->_siteID);
        $selectedUserRole = array();
        if ($userRoles->isSchemaAvailable())
        {
            if ($roleID > 0)
            {
                $selectedUserRole = $userRoles->getByID($roleID);
                if (empty($selectedUserRole))
                {
                    $selectedUserRole = array();
                }
                else
                {
                    $accessLevel = (int) $selectedUserRole['accessLevel'];
                }
            }
            if (empty($selectedUserRole))
            {
                $selectedUserRole = $userRoles->getDefaultRoleByAccessLevel($accessLevel);
                if (!empty($selectedUserRole))
                {
                    $accessLevel = (int) $selectedUserRole['accessLevel'];
                }
            }
        }

        $license = $users->getLicenseData();

        if (!$license['canAdd'] && $accessLevel > ACCESS_LEVEL_READ)
        {
            // FIXME: Shouldn't be a fatal, should go to ugprade
            $this->fatal(
                'You have no remaining user account allotments. Please upgrade your license or disable another user.'
            );
        }

        /* Bail out if any of the required fields are empty. */
        if (empty($firstName) || empty($lastName) || empty($username) ||
            empty($accessLevel) || empty($password) || empty($retypePassword))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        /* Bail out if the two passwords don't match. */
        if ($password !== $retypePassword)
        {
            CommonErrors::fatal(COMMONERROR_NOPASSWORDMATCH, $this, 'Passwords do not match.');
        }

        /* If adding an e-mail username, verify it is a valid e-mail. */
        if (strpos($username, '@') !== false && filter_var($username, FILTER_VALIDATE_EMAIL) === false)
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Username is in improper format for an E-Mail address.');
        }

        /* Make it a multisite user name if the user is part of a hosted site. */
        $unixName = $_SESSION['CATS']->getUnixName();
        if (strpos($username, '@') === false && !empty($unixName))
        {
           $username .= '@' . $_SESSION['CATS']->getSiteID();
        }

        /* Bail out if the specified username already exists. */
        if ($users->usernameExists($username))
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'The specified username already exists.');
        }

        $userID = $users->add(
            $lastName, $firstName, $email, $username, $password, $accessLevel, $eeoIsVisible
        );

        if ($userID > 0 &&
            $userRoles->isSchemaAvailable() &&
            !empty($selectedUserRole))
        {
            $userRoles->setForUser($userID, (int) $selectedUserRole['roleID']);
        }

        /* Check role (category) to make sure that the role is allowed to be set. */
        $modules = ModuleUtility::getModules();
        foreach ($modules as $moduleName => $parameters)
        {
            $moduleCategories = $parameters[MODULE_SETTINGS_USER_CATEGORIES];

            if ($moduleCategories != false)
            {
                foreach ($moduleCategories as $category)
                {
                    if ($category[1] == $role)
                    {
                        /* index 3 is the user level required to assign this type of category. */
                        if (!isset($category[3]) || $category[3] <= $this->_realAccessLevel)
                        {
                            /* Set this category. */
                            $users->updateCategories($userID, $role);
                        }
                    }
                }
            }
        }

        if ($userID <= 0)
        {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to add user.');
        }

        if (!eval(Hooks::get('SETTINGS_ON_ADD_USER'))) return;

        CATSUtility::transferRelativeURI(
            'm=settings&a=showUser&userID=' . $userID
        );
    }

    /*
     * Called by handleRequest() to process loading the user edit page.
     */
    private function editUser()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        /* Bail out if we don't have a valid user ID. */
        if (!$this->isRequiredIDValid('userID', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid user ID.');
        }

        $userID = $_GET['userID'];

        $users = new Users($this->_siteID);
        $license = $users->getLicenseData();
        $accessLevels = $users->getAccessLevels();
        $data = $users->get($userID);

        if (empty($data))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'No user found with that ID.');
        }

        if ($this->_userID == $userID)
        {
            $disableAccessChange = true;
            $cannotEnableMessage = false;
        }
        else if (($data['accessLevel'] <= ACCESS_LEVEL_READ) && ($license['diff'] < 1) && ($license['userLicenses'] != 0))
        {
            $disableAccessChange = true;
            $cannotEnableMessage = true;
        }
        else
        {
            $disableAccessChange = false;
            $cannotEnableMessage = false;
        }

        /* Change multisite usernames into single site usernames. */
        // FIXME: The last test here might be redundant.
        // FIXME: Put this in a private method. It is duplicated twice so far.
        $siteIDPosition = strpos($data['username'], '@' . $_SESSION['CATS']->getSiteID());

        if ($siteIDPosition !== false &&
            substr($data['username'], $siteIDPosition) == '@' . $_SESSION['CATS']->getSiteID())
        {
           $data['username'] = str_replace(
               '@' . $_SESSION['CATS']->getSiteID(), '', $data['username']
           );
        }

        /* Get user categories, if any. */
        $modules = ModuleUtility::getModules();
        $categories = array();
        foreach ($modules as $moduleName => $parameters)
        {
            $moduleCategories = $parameters[MODULE_SETTINGS_USER_CATEGORIES];

            if ($moduleCategories != false)
            {
                foreach ($moduleCategories as $category)
                {
                    /* index 3 is the user level required to assign this type of category. */
                    if (!isset($category[3]) || $category[3] <= $this->_realAccessLevel)
                    {
                        $categories[] = $category;
                    }
                }
            }
        }

        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        $userRoles = new UserRoles($this->_siteID);
        $userRolesRS = $userRoles->getAll();
        $selectedUserRole = $userRoles->getForUser($userID);
        $selectedUserRoleID = 0;
        if (!empty($selectedUserRole) && !empty($selectedUserRole['roleID']))
        {
            $selectedUserRoleID = (int) $selectedUserRole['roleID'];
        }
        else if (!empty($userRolesRS))
        {
            $defaultUserRole = $userRoles->getDefaultRoleByAccessLevel($data['accessLevel']);
            if (!empty($defaultUserRole))
            {
                $selectedUserRoleID = (int) $defaultUserRole['roleID'];
            }
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', '');
        $this->_template->assign('data', $data);
        $this->_template->assign('accessLevels', $accessLevels);
        $this->_template->assign('defaultAccessLevel', ACCESS_LEVEL_DELETE);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('license', $license);
        $this->_template->assign('categories', $categories);
        $this->_template->assign('userRolesEnabled', $userRoles->isSchemaAvailable() ? 1 : 0);
        $this->_template->assign('userRoles', $userRolesRS);
        $this->_template->assign('selectedUserRoleID', $selectedUserRoleID);
        $this->_template->assign('currentUser', $this->_userID);
        $this->_template->assign('cannotEnableMessage', $cannotEnableMessage);
        $this->_template->assign('disableAccessChange', $disableAccessChange);
        $this->_template->assign('auth_mode', AUTH_MODE);

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-edit-user')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernEditUserJSON(
                'settings-edit-user',
                $data,
                $accessLevels,
                $license,
                $categories,
                $EEOSettingsRS,
                $userRoles->isSchemaAvailable() ? 1 : 0,
                $userRolesRS,
                $selectedUserRoleID,
                $cannotEnableMessage,
                $disableAccessChange
            );
            return;
        }

        $this->_template->display('./modules/settings/EditUser.tpl');
    }

    /*
     * Called by handleRequest() to process updating a user.
     */
    private function onEditUser()
    {
        /* Bail out if we don't have a valid user ID. */
        if (!$this->isRequiredIDValid('userID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid user ID.');
        }

        if ($this->isRequiredIDValid('accessLevel', $_POST, true))
        {
            $accessLevel = $_POST['accessLevel'];
        }
        else
        {
            $accessLevel = -1;
        }

        $userID = $_POST['userID'];

        $firstName   = $this->getSanitisedInput('firstName', $_POST);
        $lastName    = $this->getSanitisedInput('lastName', $_POST);
        $email       = $this->getSanitisedInput('email', $_POST);
        $username    = $this->getSanitisedInput('username', $_POST);
        $password1   = $this->getTrimmedInput('password1', $_POST);
        $password2   = $this->getTrimmedInput('password2', $_POST);
        $passwordRst = $this->getTrimmedInput('passwordIsReset', $_POST);
        $role        = $this->getTrimmedInput('role', $_POST);
        $roleID      = (int) $this->getTrimmedInput('roleID', $_POST);
        $eeoIsVisible = $this->isChecked('eeoIsVisible', $_POST);

        /* Bail out if any of the required fields are empty. */
        if (empty($firstName) || empty($lastName) || empty($username))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'First name, last name and username are required.');
        }

        /* Bail out if reseting password to null. */
        if (trim($password1) == '' && $passwordRst == 1)
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Cannot set a blank password.');
        }

        /* Bail out if the two passwords don't match. */
        if ($password1 !== $password2)
        {
            CommonErrors::fatal(COMMONERROR_NOPASSWORDMATCH, $this, 'Passwords do not match.');
        }

        $userRoles = new UserRoles($this->_siteID);
        $selectedUserRole = array();
        if ($userRoles->isSchemaAvailable() && $roleID > 0)
        {
            $selectedUserRole = $userRoles->getByID($roleID);
            if (empty($selectedUserRole))
            {
                $selectedUserRole = array();
            }
            else
            {
                $accessLevel = (int) $selectedUserRole['accessLevel'];
            }
        }

        /* Don't allow access level changes to the currently logged-in user's
         * account.
         */
        if ($userID == $this->_userID)
        {
            $accessLevel = $this->_realAccessLevel;
        }

        /* If adding an e-mail username, verify it is a valid e-mail. */
        // FIXME: PREG!
        if (strpos($username, '@') !== false && filter_var($username, FILTER_VALIDATE_EMAIL) === false)
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Username is in improper format for an E-Mail address.');
        }

        /* Make it a multisite user name if the user is part of a hosted site. */
        $unixName = $_SESSION['CATS']->getUnixName();
        if (strpos($username, '@') === false && !empty($unixName))
        {
           $username .= '@' . $_SESSION['CATS']->getSiteID();
        }

        $users = new Users($this->_siteID);

        if (!$users->update($userID, $lastName, $firstName, $email, $username,
            $accessLevel, $eeoIsVisible))
        {
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to update user.');
        }

        if (trim($password1) !== '')
        {
            /* Bail out if the password is 'cats'. */
            if ($password1 == 'cats')
            {
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'New password can not equal \'cats\'.');
            }

            if (!$users->resetPassword($userID, $password1))
            {
                CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to reset password.');
            }
        }

        /* Set categories. */
        $modules = ModuleUtility::getModules();
        $users->updateCategories($userID, '');
        foreach ($modules as $moduleName => $parameters)
        {
            $moduleCategories = $parameters[MODULE_SETTINGS_USER_CATEGORIES];

            if ($moduleCategories != false)
            {
                foreach ($moduleCategories as $category)
                {
                    if ($category[1] == $role)
                    {
                       /* index 3 is the user level required to assign this type of category. */
                        if (!isset($category[3]) || $category[3] <= $this->_realAccessLevel)
                        {
                            /* Set this category. */
                            $users->updateCategories($userID, $role);
                        }
                    }
                }
            }
        }

        if ($userRoles->isSchemaAvailable() &&
            !empty($selectedUserRole) &&
            $userID != $this->_userID)
        {
            $userRoles->setForUser($userID, (int) $selectedUserRole['roleID']);
        }

        CATSUtility::transferRelativeURI(
            'm=settings&a=showUser&userID=' . $userID
        );
    }

    /*
     * Called by handleRequest() to process deleting a user.
     *
     * This is only for automated testing right now. Deleting a user this way,
     * except for in special cases, will cause referential integrity problems.
     */
    private function onDeleteUser()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_REQUEST));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_REQUEST));
        $isModernJSON = ($responseFormat === 'modern-json');
        $hasUserID = $this->isRequiredIDValid('userID', $_GET);
        $hasAutomatedTesterFlag = $this->isRequiredIDValid('iAmTheAutomatedTester', $_GET);

        if ($isModernJSON)
        {
            if ($modernPage !== '' && $modernPage !== 'settings-delete-user')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            if (!$hasUserID || !$hasAutomatedTesterFlag)
            {
                $this->renderModernDeleteUserJSON(
                    'settings-delete-user',
                    ($hasUserID ? (int) $_GET['userID'] : 0),
                    $hasUserID,
                    $hasAutomatedTesterFlag
                );
                return;
            }
        }

        /* Bail out if we don't have a valid user ID. */
        if (!$hasUserID)
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid user ID.');
        }

        /* Keep users other than the automated tester from trying this. */
        if (!$hasAutomatedTesterFlag)
        {
            CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'You are not the automated tester.');
        }

        $userID = $_GET['userID'];

        $users = new Users($this->_siteID);
        $users->delete($userID);

        if ($isModernJSON)
        {
            $this->renderModernMutationJSON(
                'settings.deleteUser.mutation.v1',
                'settings-delete-user',
                sprintf('%s?m=settings&a=manageUsers&ui=modern', CATSUtility::getIndexName()),
                true,
                'User deleted.',
                array(
                    'legacyURL' => sprintf('%s?m=settings&a=manageUsers&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=manageUsers');
    }

    /*
     * Called by handleRequest() to show the customize extra fields template.
     */
    private function customizeExtraFields()
    {
        $candidates = new Candidates($this->_siteID);
        $candidatesRS = $candidates->extraFields->getSettings();

        $contacts = new Contacts($this->_siteID);
        $contactsRS = $contacts->extraFields->getSettings();

        $companies = new Companies($this->_siteID);
        $companiesRS = $companies->extraFields->getSettings();

        $jobOrders = new JobOrders($this->_siteID);
        $jobOrdersRS = $jobOrders->extraFields->getSettings();

        $extraFieldTypes = $candidates->extraFields->getValuesTypes();

        $this->_template->assign('extraFieldSettingsCandidatesRS', $candidatesRS);
        $this->_template->assign('extraFieldSettingsContactsRS', $contactsRS);
        $this->_template->assign('extraFieldSettingsCompaniesRS', $companiesRS);
        $this->_template->assign('extraFieldSettingsJobOrdersRS', $jobOrdersRS);
        $this->_template->assign('extraFieldTypes', $extraFieldTypes);
        $this->_template->assign('active', $this);
        $this->_template->display('./modules/settings/CustomizeExtraFields.tpl');
    }

    /*
     * Called by handleRequest() to process the customize extra fields template.
     */
    private function onCustomizeExtraFields()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_REQUEST));

        if ($isModernJSON && $modernPage !== '' && $modernPage !== 'settings-customize-extra-fields')
        {
            $this->rejectUnsupportedModernPage($modernPage);
            return;
        }

        $extraFieldsMaintScript = $this->getTrimmedInput('commandList', $_POST);
        $extraFieldsMaintScriptArray = explode(',', $extraFieldsMaintScript);

        foreach($extraFieldsMaintScriptArray as $index => $commandEncoded)
        {
            $command = urldecode($commandEncoded);
            $args = explode(' ', $command);

            if (!isset($args[0]))
            {
                continue;
            }

            switch ($args[0])
            {
                case 'ADDFIELD':
                    $args = explode(' ', $command, 4);
                    $extraFields = new ExtraFields($this->_siteID, intval($args[1]));
                    $extraFields->define(urldecode($args[3]), intval($args[2]));
                    break;

                case 'DELETEFIELD':
                    $args = explode(' ', $command, 3);
                    $extraFields = new ExtraFields($this->_siteID, intval($args[1]));
                    $extraFields->remove(urldecode($args[2]));
                    break;

                case 'ADDOPTION':
                    $args = explode(' ', $command, 3);
                    $args2 = explode(':', $args[2]);

                    $extraFields = new ExtraFields($this->_siteID, intval($args[1]));
                    $extraFields->addOptionToColumn(urldecode($args2[0]), urldecode($args2[1]));
                    break;

                case 'DELETEOPTION':
                    $args = explode(' ', $command, 3);
                    $args2 = explode(':', $args[2]);

                    $extraFields = new ExtraFields($this->_siteID, intval($args[1]));
                    $extraFields->deleteOptionFromColumn(urldecode($args2[0]), urldecode($args2[1]));
                    break;

                case 'SWAPFIELDS':
                    $args = explode(' ', $command, 3);
                    $args2 = explode(':', $args[2]);

                    $extraFields = new ExtraFields($this->_siteID, intval($args[1]));
                    $extraFields->swapColumns(urldecode($args2[0]), urldecode($args2[1]));
                    break;

                case 'RENAMEROW':
                    $args = explode(' ', $command, 3);
                    $args2 = explode(':', $args[2]);

                    $extraFields = new ExtraFields($this->_siteID, intval($args[1]));
                    $extraFields->renameColumn(urldecode($args2[0]), urldecode($args2[1]));
                    break;
            }
        }

        if ($isModernJSON)
        {
            $this->renderModernMutationJSON(
                'settings.customizeExtraFields.mutation.v1',
                'settings-customize-extra-fields',
                sprintf('%s?m=settings&a=customizeExtraFields&ui=modern', CATSUtility::getIndexName()),
                true,
                'Extra fields saved.',
                array(
                    'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                    'legacyURL' => sprintf('%s?m=settings&a=customizeExtraFields&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=customizeExtraFields');
    }

    //FIXME: Document me.
    private function emailTemplates()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $emailTemplates = new EmailTemplates($this->_siteID);
        $emailTemplatesRS = $emailTemplates->getAll();

        if (!eval(Hooks::get('SETTINGS_EMAIL_TEMPLATES'))) return;

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-email-templates')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernEmailTemplatesJSON('settings-email-templates', $emailTemplatesRS);
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('emailTemplatesRS', $emailTemplatesRS);
        $this->_template->display('./modules/settings/EmailTemplates.tpl');
    }

    //FIXME: Document me.
    private function onEmailTemplates()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');

        if (!$this->isRequiredIDValid('templateID', $_POST))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid template ID.');
        }

        if (!isset($_POST['templateID']))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        $templateID = $_POST['templateID'];
        
        if(isset($_POST['emailTemplateTitle']))
        {
             $templateTitle = $_POST['emailTemplateTitle'];
        }
        else
        {
             $templateTitle = "";
        }
        
        $useThisTemplate = isset($_POST['useThisTemplate']);

        if ($useThisTemplate)
        {
            $text = $this->getTrimmedInput('messageText', $_POST);
            $disabled = 0;
        }
        else
        {
            $text = $this->getTrimmedInput('messageTextOrigional', $_POST);
            $disabled = 1;
        }

        if (!isset($_POST['templateID']))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        $emailTemplates = new EmailTemplates($this->_siteID);
        $emailTemplates->update($templateID, $templateTitle, $text, $disabled);

        if ($isModernJSON)
        {
            $this->renderModernEmailTemplateMutationJSON(
                'settings.emailTemplates.mutation.v1',
                true,
                'E-Mail template saved.'
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=emailTemplates');
    }

    private function renderModernEmailTemplatesJSON($modernPage, $emailTemplatesRS)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedTemplates = array();
        foreach ($emailTemplatesRS as $template)
        {
            $tag = isset($template['emailTemplateTag']) ? (string) $template['emailTemplateTag'] : '';
            $normalizedTemplates[] = array(
                'emailTemplateID' => (int) $template['emailTemplateID'],
                'emailTemplateTitle' => isset($template['emailTemplateTitle']) ? (string) $template['emailTemplateTitle'] : '',
                'emailTemplateTag' => $tag,
                'text' => isset($template['text']) ? (string) $template['text'] : '',
                'disabled' => isset($template['disabled']) ? (int) $template['disabled'] : 0,
                'possibleVariables' => isset($template['possibleVariables']) ? (string) $template['possibleVariables'] : '',
                'isCustom' => (strpos($tag, 'CUSTOM') === 0)
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.emailTemplates.v1',
                'modernPage' => $modernPage
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=emailTemplates', $baseURL),
                'addURL' => sprintf('%s?m=settings&a=addEmailTemplate&ui=modern', $baseURL),
                'deleteURL' => sprintf('%s?m=settings&a=deleteEmailTemplate&ui=modern', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=emailTemplates&ui=legacy', $baseURL)
            ),
            'templates' => $normalizedTemplates
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernEmailTemplateMutationJSON($contractKey, $success, $message)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => (string) $contractKey,
                'modernPage' => 'settings-email-templates'
            ),
            'success' => (bool) $success,
            'message' => (string) $message,
            'actions' => array(
                'routeURL' => sprintf('%s?m=settings&a=emailTemplates&ui=modern', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernDeleteUserJSON($modernPage, $requestedUserID, $hasUserID, $hasAutomatedTesterFlag)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.deleteUser.v1',
                'modernPage' => (string) $modernPage
            ),
            'state' => array(
                'requestedUserID' => (int) $requestedUserID,
                'hasUserID' => ($hasUserID ? true : false),
                'hasAutomatedTesterFlag' => ($hasAutomatedTesterFlag ? true : false)
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=deleteUser', $baseURL),
                'deleteActionURL' => sprintf('%s?m=settings&a=deleteUser', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=manageUsers&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=deleteUser&ui=legacy', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernEmailSettingsJSON($modernPage, $mailerSettingsRS, $candidateJoborderStatusSendsMessage, $emailTemplatesRS, $saved)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedMailerSettings = array();
        foreach ($mailerSettingsRS as $setting => $value)
        {
            $normalizedMailerSettings[$setting] = (string) $value;
        }

        $normalizedStatusMessages = array();
        foreach ($candidateJoborderStatusSendsMessage as $statusID => $isEnabled)
        {
            $normalizedStatusMessages[(string) $statusID] = ((int) $isEnabled === 1);
        }

        $normalizedTemplates = array();
        foreach ($emailTemplatesRS as $template)
        {
            $normalizedTemplates[] = array(
                'emailTemplateID' => (int) $template['emailTemplateID'],
                'emailTemplateTitle' => isset($template['emailTemplateTitle']) ? (string) $template['emailTemplateTitle'] : '',
                'emailTemplateTag' => isset($template['emailTemplateTag']) ? (string) $template['emailTemplateTag'] : '',
                'disabled' => isset($template['disabled']) ? (int) $template['disabled'] : 0,
                'isActive' => !(isset($template['disabled']) && (int) $template['disabled'] === 1)
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.emailSettings.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'saved' => (bool) $saved,
                'sessionCookie' => (string) $_SESSION['CATS']->getCookie()
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=emailSettings', $baseURL),
                'testURL' => sprintf('%s?m=settings&a=emailSettings', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=emailSettings&ui=legacy', $baseURL)
            ),
            'settings' => $normalizedMailerSettings,
            'candidateJoborderStatusSendsMessage' => $normalizedStatusMessages,
            'emailTemplates' => $normalizedTemplates
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernFeedbackSettingsJSON($modernPage, $recipientOptions, $feedbackRecipientUserID, $saved)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedRecipientOptions = array();
        foreach ($recipientOptions as $recipientOption)
        {
            $normalizedRecipientOptions[] = array(
                'userID' => isset($recipientOption['userID']) ? (int) $recipientOption['userID'] : 0,
                'fullName' => isset($recipientOption['fullName']) ? (string) $recipientOption['fullName'] : ''
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.feedbackSettings.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'saved' => (bool) $saved,
                'feedbackRecipientUserID' => (int) $feedbackRecipientUserID
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=feedbackSettings', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=feedbackSettings&ui=legacy', $baseURL)
            ),
            'recipientOptions' => $normalizedRecipientOptions
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernForceEmailJSON($modernPage, $message, $messageSuccess)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.forceEmail.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'message' => (string) $message,
                'messageSuccess' => (bool) $messageSuccess,
                'inputType' => 'siteName',
                'inputTypeTextParam' => 'E-Mail Address',
                'title' => 'E-Mail Address',
                'prompt' => 'CATS does not know what your e-mail address is for sending notifications. Please type your e-mail address in the box below.'
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=forceEmail', $baseURL),
                'homeURL' => sprintf('%s?m=home', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=forceEmail&ui=legacy', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernGoogleOIDCSettingsJSON($modernPage, $googleOIDCSettingsRS, $saved, $testOk, $testMessage)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedSettings = array();
        foreach ($googleOIDCSettingsRS as $setting => $value)
        {
            $normalizedSettings[$setting] = (string) $value;
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.googleOIDCSettings.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'saved' => (bool) $saved,
                'testOk' => (bool) $testOk,
                'testMessage' => (string) $testMessage
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=googleOIDCSettings', $baseURL),
                'testURL' => sprintf('%s?m=settings&a=googleOIDCSettings', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=googleOIDCSettings&ui=legacy', $baseURL)
            ),
            'settings' => $normalizedSettings
        );

        $this->respondModernJSON(200, $payload);
    }

    /*
     * Called by handleRequest() to show a page with a message in the top frame
     * with a close window button.
     */
    private function previewPage()
    {
        $previewPage = $_GET['url'];
        $previewMessage = $_GET['message'];
        $this->_template->assign('previewPage', $previewPage);
        $this->_template->assign('previewMessage', $previewMessage);
        $this->_template->display('./modules/settings/PreviewPage.tpl');
    }

    /*
     * Called by handleRequest() to show the message in the top frame
     * with a close window button.
     */
    private function previewPageTop()
    {
        $previewMessage = $_GET['message'];
        $this->_template->assign('previewMessage', $previewMessage);
        $this->_template->display('./modules/settings/PreviewPageTop.tpl');
    }

    /*
     * Called by handleRequest() to show the careers website settings editor.
     */
    private function careerPortalTemplateEdit()
    {
        $templateName = $this->getTrimmedInput('templateName', $_GET);
        if (empty($templateName))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        $careerPortalSettings = new CareerPortalSettings($this->_siteID);

        $templateSource = $careerPortalSettings->getAllFromCustomTemplate($templateName);
        if (empty($templateSource))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'No custom template with that name exists.');
        }

        $templateBySetting = array();
        foreach ($templateSource as $templateLine)
        {
            $templateBySetting[$templateLine['setting']] = $templateLine['value'];
        }

        /* Arrange the array entries in a way that makes sense. */
        $desiredOrder = $careerPortalSettings->requiredTemplateFields;

        $template = array();
        foreach ($desiredOrder as $item)
        {
            if (isset($templateBySetting[$item]))
            {
                $template[$item] = $templateBySetting[$item];
            }
            else
            {
                $template[$item] = '';
            }
        }

        foreach ($templateBySetting as $item => $value)
        {
            if (!isset($template[$item]) && $item != '')
            {
                $template[$item] = $templateBySetting[$item];
            }
        }

        /* Get extra fields. */
        $jobOrders = new JobOrders($this->_siteID);
        $extraFieldsForJobOrders = $jobOrders->extraFields->getValuesForAdd();

        $candidates = new Candidates($this->_siteID);
        $extraFieldsForCandidates = $candidates->extraFields->getValuesForAdd();

        /* Get EEO settings. */
        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('template', $template);
        $this->_template->assign('templateName', $templateName);
        $this->_template->assign('eeoEnabled', $EEOSettingsRS['enabled']);
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->assign('extraFieldsForJobOrders', $extraFieldsForJobOrders);
        $this->_template->assign('extraFieldsForCandidates', $extraFieldsForCandidates);
        $this->_template->display('./modules/settings/CareerPortalTemplateEdit.tpl');
    }

    //FIXME: Document me.
    private function onCareerPortalTemplateEdit()
    {
        $templateName = $this->getTrimmedInput('templateName', $_POST);
        if (empty($templateName) || !isset($_POST['continueEdit']))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
        }

        $continueEdit = $_POST['continueEdit'];

        $careerPortalSettings = new CareerPortalSettings($this->_siteID);

        $templateSource = $careerPortalSettings->getAllFromCustomTemplate($templateName);

        // FIXME: Document this md5() stuff.
        foreach ($templateSource as $templateLine)
        {
            if ($templateLine['setting'] != '')
            {
                $careerPortalSettings->setForTemplate(
                    $templateLine['setting'],
                    $_POST[md5($templateLine['setting'])],
                    $templateName
                );
            }
        }

        foreach ($careerPortalSettings->requiredTemplateFields as $field)
        {
            if ($field != '' && isset($_POST[md5($field)]))
            {
                $careerPortalSettings->setForTemplate(
                    $field,
                    $_POST[md5($field)],
                    $templateName
                );
            }
        }

        if ($continueEdit == '1')
        {
            CATSUtility::transferRelativeURI(
                'm=settings&a=careerPortalTemplateEdit&templateName=' . urlencode($templateName)
            );
        }
        else
        {
            CATSUtility::transferRelativeURI(
                'm=settings&a=careerPortalSettings&templateName=' . urlencode($templateName)
            );
        }
    }

    /*
     * Called by handleRequest() to show the careers website settings template.
     */
    private function careerPortalSettings()
    {
        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $careerPortalSettingsRS = $careerPortalSettings->getAll();
        $careerPortalTemplateNames = $careerPortalSettings->getDefaultTemplates();
        $careerPortalTemplateCustomNames = $careerPortalSettings->getCustomTemplates();

        $careerPortalURL = CATSUtility::getAbsoluteURI() . 'careers/';

        if (!eval(Hooks::get('SETTINGS_CAREER_PORTAL'))) return;

        $questionnaires = new Questionnaire($this->_siteID);
        $data = $questionnaires->getAll(true);

        $this->_template->assign('active', $this);
        $this->_template->assign('questionnaires', $data);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('careerPortalSettingsRS', $careerPortalSettingsRS);
        $this->_template->assign('careerPortalTemplateNames', $careerPortalTemplateNames);
        $this->_template->assign('careerPortalTemplateCustomNames', $careerPortalTemplateCustomNames);
        $this->_template->assign('careerPortalURL', $careerPortalURL);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->display('./modules/settings/CareerPortalSettings.tpl');
    }

    //FIXME: Document me.
    private function onCareerPortalSettings()
    {
        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $careerPortalSettingsRS = $careerPortalSettings->getAll();

        foreach ($careerPortalSettingsRS as $setting => $value)
        {
            eval(Hooks::get('XML_FEED_SUBMISSION_SETTINGS_BODY'));
            if ($setting == 'enabled')
            {
                if ($this->isChecked($setting, $_POST))
                {
                    $careerPortalSettings->set($setting, '1');
                    if($value != '1')
                    {
                        CATSUtility::transferRelativeURI('m=settings&a=careerPortalSettings');
                    }
                }
                else
                {
                    $careerPortalSettings->set($setting, '0');
                    if($value != '0')
                    {
                        CATSUtility::transferRelativeURI('m=settings&a=careerPortalSettings');
                    }
                }
            }
            else if ($setting == 'allowBrowse')
            {
                if ($this->isChecked($setting, $_POST))
                {
                    $careerPortalSettings->set($setting, '1');
                }
                else
                {
                    $careerPortalSettings->set($setting, '0');
                }
            }
            else if ($setting == 'candidateRegistration')
            {
                if ($this->isChecked($setting, $_POST))
                {
                    $careerPortalSettings->set($setting, '1');
                }
                else
                {
                    $careerPortalSettings->set($setting, '0');
                }
            }
            else if ($setting == 'showDepartment')
            {
                if ($this->isChecked($setting, $_POST))
                {
                    $careerPortalSettings->set($setting, '1');
                }
                else
                {
                    $careerPortalSettings->set($setting, '0');
                }
            }
            else if ($setting == 'showCompany')
            {
                if ($this->isChecked($setting, $_POST))
                {
                    $careerPortalSettings->set($setting, '1');
                }
                else
                {
                    $careerPortalSettings->set($setting, '0');
                }
            }
            else
            {
                if (isset($_POST[$setting]))
                {
                    $careerPortalSettings->set($setting, $_POST[$setting]);
                }
            }
        }

        CATSUtility::transferRelativeURI('m=settings&a=administration');
    }

    private function onCareerPortalTweak()
    {
        if (!isset($_GET['p']))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid page.');
        }

        $page = $_GET['p'];

        $careerPortalSettings = new CareerPortalSettings($this->_siteID);

        switch ($page)
        {
            case 'new':
                $origName = 'Blank Page';
                $duplicateName = $this->getTrimmedInput('newName', $_POST);

                /* Copy default templates or existing customized templates from orig to duplicate. */
                $templateSource1 = $careerPortalSettings->getAllFromDefaultTemplate($origName);
                $templateSource2 = $careerPortalSettings->getAllFromCustomTemplate($origName);

                $templateSource = array_merge($templateSource1, $templateSource2);

                foreach ($templateSource as $setting)
                {
                    $careerPortalSettings->setForTemplate(
                        $setting['setting'],
                        $setting['value'],
                        $duplicateName
                    );
                }
                break;

            case 'duplicate':
                $origName      = $this->getTrimmedInput('origName', $_POST);
                $duplicateName = $this->getTrimmedInput('duplicateName', $_POST);

                if (empty($origName) || empty($duplicateName))
                {
                    CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
                }

                /* Copy default templates or existing customized templates from orig to duplicate. */
                $templateSource1 = $careerPortalSettings->getAllFromDefaultTemplate($origName);
                $templateSource2 = $careerPortalSettings->getAllFromCustomTemplate($origName);

                $templateSource = array_merge($templateSource1, $templateSource2);

                foreach ($templateSource as $setting)
                {
                    $careerPortalSettings->setForTemplate(
                        $setting['setting'],
                        $setting['value'],
                        $duplicateName
                    );
                }
                break;

            case 'delete':
                //FIXME: Input validation.
                $delName = $_POST['delName'];
                $careerPortalSettings->deleteCustomTemplate($delName);
                break;

            case 'setAsActive':
                //FIXME: Input validation.
                $activeName = $_POST['activeName'];
                $careerPortalSettings->set('activeBoard', $activeName);
                break;
        }

        CATSUtility::transferRelativeURI('m=settings&a=careerPortalSettings');
    }

    /*
     * Called by handleRequest() to show the careers website settings template.
     */
    private function EEOEOCSettings()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-eeo')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernEEOJSON('settings-eeo', $EEOSettingsRS);
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('EEOSettingsRS', $EEOSettingsRS);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->display('./modules/settings/EEOEOCSettings.tpl');
    }

    //FIXME: Document me.
    private function onEEOEOCSettings()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $EEOSettings = new EEOSettings($this->_siteID);
        $EEOSettingsRS = $EEOSettings->getAll();

        foreach ($EEOSettingsRS as $setting => $value)
        {
            if ($this->isChecked($setting, $_POST))
            {
                $EEOSettings->set($setting, '1');
            }
            else
            {
                $EEOSettings->set($setting, '0');
            }
        }

        if ($isModernJSON)
        {
            $this->renderModernMutationJSON(
                'settings.eeo.mutation.v1',
                'settings-eeo',
                sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                true,
                'EEO settings saved.',
                array(
                    'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                    'legacyURL' => sprintf('%s?m=settings&a=eeo&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=administration');
    }

    /*
     * Called by handleRequest() to show the GDPR settings template.
     */
    private function gdprSettings()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $gdprSettings = new GDPRSettings($this->_siteID);
        $gdprSettingsRS = $gdprSettings->getAll();
        $gdprSaved = isset($_GET['saved']);

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-gdpr-settings')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernGDPRSettingsJSON(
                'settings-gdpr-settings',
                $gdprSettingsRS,
                $gdprSaved
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('gdprSettings', $gdprSettingsRS);
        $this->_template->assign('gdprSaved', $gdprSaved);
        $this->_template->display('./modules/settings/GDPRSettings.tpl');
    }

    private function onGDPRSettings()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $gdprSettings = new GDPRSettings($this->_siteID);

        $expirationYears = $this->getTrimmedInput('gdprExpirationYears', $_POST);
        $gdprFromAddress = trim($this->getTrimmedInput('gdprFromAddress', $_POST));

        if (!ctype_digit((string) $expirationYears) || (int) $expirationYears <= 0) {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Expiration must be a positive whole number of years.');
        }

        if ($gdprFromAddress !== '' && !StringUtility::isEmailAddress($gdprFromAddress))
        {
            CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'GDPR from address is not a valid email address.');
        }

        $gdprSettings->set('gdprExpirationYears', (string) (int) $expirationYears);
        $gdprSettings->set(GDPRSettings::SETTING_FROM_ADDRESS, $gdprFromAddress);

        if ($isModernJSON)
        {
            $this->renderModernGDPRSettingsMutationJSON(
                true,
                'GDPR settings saved.'
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=gdprSettings&saved=1');
    }

    private function renderModernGDPRSettingsJSON($modernPage, $gdprSettingsRS, $gdprSaved)
    {
        $baseURL = CATSUtility::getIndexName();
        $gdprExpirationYears = isset($gdprSettingsRS['gdprExpirationYears'])
            ? (string) $gdprSettingsRS['gdprExpirationYears']
            : '';
        $gdprFromAddress = isset($gdprSettingsRS[GDPRSettings::SETTING_FROM_ADDRESS])
            ? (string) $gdprSettingsRS[GDPRSettings::SETTING_FROM_ADDRESS]
            : '';

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.gdprSettings.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'gdprSaved' => ($gdprSaved ? true : false)
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=gdprSettings', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=gdprSettings&ui=legacy', $baseURL)
            ),
            'settings' => array(
                'gdprExpirationYears' => $gdprExpirationYears,
                'gdprFromAddress' => $gdprFromAddress
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernGDPRSettingsMutationJSON($success, $message)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.gdprSettings.mutation.v1',
                'modernPage' => 'settings-gdpr-settings'
            ),
            'success' => (bool) $success,
            'message' => (string) $message,
            'actions' => array(
                'routeURL' => sprintf('%s?m=settings&a=gdprSettings&ui=modern', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function feedbackSettings()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $feedbackSettings = new FeedbackSettings($this->_siteID);
        $feedbackSettingsRS = $feedbackSettings->getAll();

        $users = new Users($this->_siteID);
        $usersRS = $users->getSelectList();
        $recipientOptions = array();
        foreach ($usersRS as $userData)
        {
            $userID = (int) $userData['userID'];
            if ($userID <= 0)
            {
                continue;
            }

            $fullName = trim((string) ($userData['firstName'] . ' ' . $userData['lastName']));
            if ($fullName === '')
            {
                $fullName = trim((string) $userData['username']);
            }
            if ($fullName === '')
            {
                $fullName = 'User #' . $userID;
            }

            $recipientOptions[] = array(
                'userID' => $userID,
                'fullName' => $fullName
            );
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('recipientOptions', $recipientOptions);
        $this->_template->assign(
            'feedbackRecipientUserID',
            (int) $feedbackSettingsRS[FeedbackSettings::SETTING_RECIPIENT_USER_ID]
        );
        $this->_template->assign('feedbackSaved', isset($_GET['saved']));

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-feedback-settings')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernFeedbackSettingsJSON(
                'settings-feedback-settings',
                $recipientOptions,
                (int) $feedbackSettingsRS[FeedbackSettings::SETTING_RECIPIENT_USER_ID],
                isset($_GET['saved'])
            );
            return;
        }

        $this->_template->display('./modules/settings/FeedbackSettings.tpl');
    }

    private function onFeedbackSettings()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $recipientUserID = (int) $this->getTrimmedInput('feedbackRecipientUserID', $_POST);
        if ($recipientUserID > 0)
        {
            $users = new Users($this->_siteID);
            $userData = $users->get($recipientUserID);
            if (empty($userData))
            {
                CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid feedback recipient user.');
            }
        }

        $feedbackSettings = new FeedbackSettings($this->_siteID);
        $feedbackSettings->setRecipientUserID($recipientUserID);

        if ($isModernJSON)
        {
            $this->renderModernMutationJSON(
                'settings.feedbackSettings.mutation.v1',
                'settings-feedback-settings',
                sprintf('%s?m=settings&a=feedbackSettings&ui=modern', CATSUtility::getIndexName()),
                true,
                'Feedback settings saved.',
                array(
                    'legacyURL' => sprintf('%s?m=settings&a=feedbackSettings&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=feedbackSettings&saved=1');
    }

    private function rejectionReasons()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $rejectionReasons = $this->getRejectionReasonsList();
        $saved = isset($_GET['saved']);

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-rejection-reasons')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernRejectionReasonsJSON(
                'settings-rejection-reasons',
                $rejectionReasons,
                $saved
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('rejectionReasons', $rejectionReasons);
        $this->_template->assign('saved', $saved);
        $this->_template->display('./modules/settings/RejectionReasons.tpl');
    }

    private function onRejectionReasons()
    {
        $action = $this->getTrimmedInput('action', $_POST);

        if ($action === 'add')
        {
            $label = substr($this->getTrimmedInput('newLabel', $_POST), 0, 255);
            if ($label === '')
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Reason label is required.');
            }

            $this->addRejectionReason($label);
        }
        else if ($action === 'update')
        {
            $reasonID = (int) $this->getTrimmedInput('reasonID', $_POST);
            $label = substr($this->getTrimmedInput('label', $_POST), 0, 255);

            if ($reasonID <= 0)
            {
                CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid rejection reason.');
            }

            if ($label === '')
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Reason label is required.');
            }

            $this->updateRejectionReason($reasonID, $label);
        }
        else
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid action.');
        }

        CATSUtility::transferRelativeURI('m=settings&a=rejectionReasons&saved=1');
    }

    private function getRejectionReasonsList()
    {
        $db = DatabaseConnection::getInstance();

        $sql = sprintf(
            "SELECT
                rejection_reason_id AS rejectionReasonID,
                label
            FROM
                rejection_reason
            ORDER BY
                rejection_reason_id"
        );

        return $db->getAllAssoc($sql);
    }

    private function addRejectionReason($label)
    {
        $db = DatabaseConnection::getInstance();

        $sql = sprintf(
            "INSERT INTO
                rejection_reason
            (
                label,
                created_at,
                updated_at
            ) VALUES (
                %s,
                NOW(),
                NOW()
            )",
            $db->makeQueryString($label)
        );

        return $db->query($sql);
    }

    private function updateRejectionReason($reasonID, $label)
    {
        $db = DatabaseConnection::getInstance();

        $sql = sprintf(
            "UPDATE
                rejection_reason
            SET
                label = %s,
                updated_at = NOW()
            WHERE
                rejection_reason_id = %s",
            $db->makeQueryString($label),
            $db->makeQueryString($reasonID)
        );

        return $db->query($sql);
    }

    /*
     * Called by handleRequest() to show the TalentFitFlow settings template.
     */
    private function talentFitFlowSettings()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $tffSettings = new TalentFitFlowSettings($this->_siteID);
        $tffSettingsRS = $tffSettings->getAll();

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-talent-fit-flow-settings')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernTalentFitFlowSettingsJSON(
                'settings-talent-fit-flow-settings',
                $tffSettingsRS,
                isset($_GET['saved']),
                null,
                null
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('tffSettings', $tffSettingsRS);
        $this->_template->assign('tffSaved', isset($_GET['saved']));
        $this->_template->display('./modules/settings/TalentFitFlowSettings.tpl');
    }

    /*
     * Called by handleRequest() to process the TalentFitFlow settings template.
     */
    private function onTalentFitFlowSettings()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $tffSettings = new TalentFitFlowSettings($this->_siteID);

        $baseUrl = $this->getTrimmedInput('baseUrl', $_POST);
        $apiKey = $this->getTrimmedInput('apiKey', $_POST);
        $hmacSecret = $this->getTrimmedInput('hmacSecret', $_POST);

        if (isset($_POST['testConnection']))
        {
            $client = new TalentFitFlowClient(
                ($baseUrl !== '') ? $baseUrl : null,
                ($apiKey !== '') ? $apiKey : null,
                ($hmacSecret !== '') ? $hmacSecret : null
            );

            $testResult = $client->ping();
            if ($testResult === false)
            {
                $this->_template->assign('tffTestOk', false);
                $this->_template->assign('tffTestMessage', $client->getLastError());
            }
            else
            {
                $configured = isset($testResult['opencatsUserConfigured']) && $testResult['opencatsUserConfigured'] ? 'true' : 'false';
                $this->_template->assign('tffTestOk', (isset($testResult['ok']) && $testResult['ok']));
                $this->_template->assign('tffTestMessage', 'Ping OK. opencatsUserConfigured: ' . $configured);
            }

            if ($isModernJSON)
            {
                $this->renderModernTalentFitFlowSettingsMutationJSON(
                    (isset($testResult['ok']) && $testResult['ok']),
                    (isset($testResult['ok']) && $testResult['ok']) ? 'Ping OK.' : $client->getLastError(),
                    sprintf('%s?m=settings&a=talentFitFlowSettings&ui=modern', CATSUtility::getIndexName()),
                    false,
                    (isset($testResult['ok']) && $testResult['ok']),
                    isset($testResult['ok']) && $testResult['ok']
                        ? 'Ping OK. opencatsUserConfigured: ' . $configured
                        : $client->getLastError()
                );
                return;
            }

            $this->_template->assign('active', $this);
            $this->_template->assign('subActive', 'Administration');
            $this->_template->assign('tffSettings', array(
                'baseUrl' => $baseUrl,
                'apiKey' => $apiKey,
                'hmacSecret' => $hmacSecret
            ));
            $this->_template->assign('tffSaved', false);
            $this->_template->display('./modules/settings/TalentFitFlowSettings.tpl');
            return;
        }

        $tffSettings->set('baseUrl', $baseUrl);
        $tffSettings->set('apiKey', $apiKey);
        $tffSettings->set('hmacSecret', $hmacSecret);

        if ($isModernJSON)
        {
            $this->renderModernTalentFitFlowSettingsMutationJSON(
                true,
                'TalentFitFlow settings saved.',
                sprintf('%s?m=settings&a=talentFitFlowSettings&ui=modern&saved=1', CATSUtility::getIndexName()),
                true,
                null,
                null
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=talentFitFlowSettings&saved=1');
    }

    /*
     * Called by handleRequest() to show the Google OIDC settings template.
     */
    private function googleOIDCSettings()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $googleOIDCSettings = new GoogleOIDCSettings($this->_siteID);
        $googleOIDCSettingsRS = $googleOIDCSettings->getAll();

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-google-oidc-settings')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernGoogleOIDCSettingsJSON(
                'settings-google-oidc-settings',
                $googleOIDCSettingsRS,
                isset($_GET['saved']),
                false,
                ''
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('googleOIDCSettings', $googleOIDCSettingsRS);
        $this->_template->assign('googleOIDCSaved', isset($_GET['saved']));
        $this->_template->display('./modules/settings/GoogleOIDCSettings.tpl');
    }

    /*
     * Called by handleRequest() to process the Google OIDC settings template.
     */
    private function onGoogleOIDCSettings()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $enabled = (UserInterface::isChecked('enabled', $_POST) ? '1' : '0');
        $clientId = $this->getTrimmedInput('clientId', $_POST);
        $clientSecret = $this->getTrimmedInput('clientSecret', $_POST);
        $redirectUri = $this->getTrimmedInput('redirectUri', $_POST);
        $hostedDomain = strtolower($this->getTrimmedInput('hostedDomain', $_POST));
        $siteIdRaw = $this->getTrimmedInput('siteId', $_POST);
        $siteId = (string) ((int) $siteIdRaw > 0 ? (int) $siteIdRaw : (defined('LDAP_SITEID') ? (int) LDAP_SITEID : 1));
        $autoProvisionEnabled = (UserInterface::isChecked('autoProvisionEnabled', $_POST) ? '1' : '0');
        $notifyEmail = strtolower($this->getTrimmedInput('notifyEmail', $_POST));
        $fromEmail = strtolower($this->getTrimmedInput('fromEmail', $_POST));
        $requestSubject = $this->getTrimmedInput('requestSubject', $_POST);

        $settingsPayload = array(
            'enabled' => $enabled,
            'clientId' => $clientId,
            'clientSecret' => $clientSecret,
            'redirectUri' => $redirectUri,
            'hostedDomain' => $hostedDomain,
            'siteId' => $siteId,
            'autoProvisionEnabled' => $autoProvisionEnabled,
            'notifyEmail' => $notifyEmail,
            'fromEmail' => $fromEmail,
            'requestSubject' => $requestSubject
        );

        if (isset($_POST['testConfig']))
        {
            $testResult = $this->testGoogleOIDCSettings($settingsPayload);

            if ($isModernJSON)
            {
                $this->renderModernMutationJSON(
                    'settings.googleOIDCSettings.mutation.v1',
                    'settings-google-oidc-settings',
                    sprintf('%s?m=settings&a=googleOIDCSettings&ui=modern', CATSUtility::getIndexName()),
                    $testResult['ok'],
                    $testResult['message'],
                    array(
                        'legacyURL' => sprintf('%s?m=settings&a=googleOIDCSettings&ui=legacy', CATSUtility::getIndexName())
                    )
                );
                return;
            }

            $this->_template->assign('active', $this);
            $this->_template->assign('subActive', 'Administration');
            $this->_template->assign('googleOIDCSettings', $settingsPayload);
            $this->_template->assign('googleOIDCSaved', false);
            $this->_template->assign('googleOIDCTestOk', $testResult['ok']);
            $this->_template->assign('googleOIDCTestMessage', $testResult['message']);
            $this->_template->display('./modules/settings/GoogleOIDCSettings.tpl');
            return;
        }

        $googleOIDCSettings = new GoogleOIDCSettings($this->_siteID);
        $googleOIDCSettings->set('enabled', $enabled);
        $googleOIDCSettings->set('clientId', $clientId);
        $googleOIDCSettings->set('clientSecret', $clientSecret);
        $googleOIDCSettings->set('redirectUri', $redirectUri);
        $googleOIDCSettings->set('hostedDomain', $hostedDomain);
        $googleOIDCSettings->set('siteId', $siteId);
        $googleOIDCSettings->set('autoProvisionEnabled', $autoProvisionEnabled);
        $googleOIDCSettings->set('notifyEmail', $notifyEmail);
        $googleOIDCSettings->set('fromEmail', $fromEmail);
        $googleOIDCSettings->set('requestSubject', $requestSubject);

        if ($isModernJSON)
        {
            $this->renderModernMutationJSON(
                'settings.googleOIDCSettings.mutation.v1',
                'settings-google-oidc-settings',
                sprintf('%s?m=settings&a=googleOIDCSettings&ui=modern', CATSUtility::getIndexName()),
                true,
                'Google OIDC settings saved.',
                array(
                    'legacyURL' => sprintf('%s?m=settings&a=googleOIDCSettings&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=googleOIDCSettings&saved=1');
    }

    private function testGoogleOIDCSettings($settings)
    {
        $errors = array();
        $warnings = array();

        if (trim($settings['clientId']) === '')
        {
            $errors[] = 'Client ID is required.';
        }

        if (trim($settings['clientSecret']) === '')
        {
            $errors[] = 'Client Secret is required.';
        }

        $effectiveRedirectURI = trim($settings['redirectUri']);
        if ($effectiveRedirectURI === '')
        {
            $effectiveRedirectURI = CATSUtility::getAbsoluteURI(
                CATSUtility::getIndexName() . '?m=login&a=googleCallback'
            );
        }

        $redirectParts = @parse_url($effectiveRedirectURI);
        if ($redirectParts === false || !isset($redirectParts['scheme']) || !isset($redirectParts['host']))
        {
            $errors[] = 'Redirect URI is invalid.';
        }
        else if ($redirectParts['scheme'] !== 'https')
        {
            $warnings[] = 'Redirect URI is not HTTPS.';
        }

        if (trim($settings['hostedDomain']) !== '')
        {
            $domains = preg_split('/[\s,;]+/', strtolower(trim($settings['hostedDomain'])));
            foreach ($domains as $domain)
            {
                if ($domain === '')
                {
                    continue;
                }

                if (!preg_match('/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/', $domain))
                {
                    $errors[] = 'Invalid hosted domain entry: ' . $domain;
                    break;
                }
            }
        }

        $probe = $this->httpGetForGoogleTest(
            'https://accounts.google.com/.well-known/openid-configuration'
        );
        if (!$probe['ok'])
        {
            $errors[] = 'Unable to reach Google OpenID configuration endpoint.';
        }
        else
        {
            $payload = json_decode($probe['body'], true);
            if (!is_array($payload) ||
                empty($payload['authorization_endpoint']) ||
                empty($payload['token_endpoint']))
            {
                $errors[] = 'Google OpenID configuration response is invalid.';
            }
        }

        if (!empty($errors))
        {
            return array(
                'ok' => false,
                'message' => implode(' ', $errors)
            );
        }

        $message = 'Google configuration looks valid. Effective redirect URI: ' . $effectiveRedirectURI . '.';
        if (!empty($warnings))
        {
            $message .= ' Warning: ' . implode(' ', $warnings);
        }

        return array(
            'ok' => true,
            'message' => $message
        );
    }

    private function httpGetForGoogleTest($url)
    {
        if (function_exists('curl_init'))
        {
            $curl = curl_init();
            curl_setopt($curl, CURLOPT_URL, $url);
            curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 10);
            curl_setopt($curl, CURLOPT_TIMEOUT, 20);
            curl_setopt($curl, CURLOPT_FOLLOWLOCATION, false);
            curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, true);
            curl_setopt($curl, CURLOPT_SSL_VERIFYHOST, 2);
            curl_setopt($curl, CURLOPT_HTTPHEADER, array('Accept: application/json'));

            $body = curl_exec($curl);
            $statusCode = (int) curl_getinfo($curl, CURLINFO_HTTP_CODE);
            $error = '';
            if ($body === false)
            {
                $error = curl_error($curl);
                $body = '';
            }
            curl_close($curl);

            return array(
                'ok' => ($statusCode >= 200 && $statusCode < 300 && $error === ''),
                'statusCode' => $statusCode,
                'body' => $body,
                'error' => $error
            );
        }

        $contextOptions = array(
            'http' => array(
                'method' => 'GET',
                'ignore_errors' => true,
                'timeout' => 20,
                'header' => "Accept: application/json"
            )
        );

        $body = @file_get_contents(
            $url,
            false,
            stream_context_create($contextOptions)
        );

        $statusCode = 0;
        if (isset($http_response_header[0]) &&
            preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches))
        {
            $statusCode = (int) $matches[1];
        }

        return array(
            'ok' => ($body !== false && $statusCode >= 200 && $statusCode < 300),
            'statusCode' => $statusCode,
            'body' => ($body === false ? '' : $body),
            'error' => ($body === false ? 'HTTP request failed.' : '')
        );
    }

    private function rolePagePermissions()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $rolePagePermissions = new RolePagePermissions($this->_siteID);
        $matrixData = $rolePagePermissions->getRoleMatrix();
        $rolePermissionsEnabled = $rolePagePermissions->isSchemaAvailable() ? 1 : 0;
        $message = isset($_GET['message']) ? $_GET['message'] : '';

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-role-page-permissions')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernRolePagePermissionsJSON(
                'settings-role-page-permissions',
                $rolePermissionsEnabled,
                $matrixData,
                RolePagePermissions::getAccessOptions(),
                $message
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('rolePermissionsEnabled', $rolePermissionsEnabled);
        $this->_template->assign('roles', $matrixData['roles']);
        $this->_template->assign('pages', $matrixData['pages']);
        $this->_template->assign('matrix', $matrixData['matrix']);
        $this->_template->assign('accessOptions', RolePagePermissions::getAccessOptions());
        $this->_template->assign('message', $message);
        $this->_template->display('./modules/settings/RolePagePermissions.tpl');
    }

    private function onRolePagePermissions()
    {
        $rolePagePermissions = new RolePagePermissions($this->_siteID);
        if (!$rolePagePermissions->isSchemaAvailable())
        {
            CATSUtility::transferRelativeURI('m=settings&a=rolePagePermissions&message=' . urlencode('Role/page permission schema is not available yet. Apply migrations first.'));
            return;
        }

        $beforeMatrix = $rolePagePermissions->getRoleMatrix();
        $postedMatrix = array();
        if (isset($_POST['perm']) && is_array($_POST['perm']))
        {
            $postedMatrix = $_POST['perm'];
        }

        if ($rolePagePermissions->saveRoleMatrix($postedMatrix))
        {
            $afterMatrix = $rolePagePermissions->getRoleMatrix();
            $this->logRolePagePermissionsAudit($beforeMatrix, $afterMatrix);
            CATSUtility::transferRelativeURI('m=settings&a=rolePagePermissions&message=' . urlencode('Role access matrix saved.'));
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=rolePagePermissions&message=' . urlencode('Failed to save role access matrix.'));
    }

    private function logRolePagePermissionsAudit($beforeMatrix, $afterMatrix)
    {
        $beforeSnapshot = $this->buildRolePagePermissionsSnapshot($beforeMatrix);
        $afterSnapshot = $this->buildRolePagePermissionsSnapshot($afterMatrix);

        $changes = array();
        foreach ($afterSnapshot as $roleName => $pages)
        {
            $beforePages = isset($beforeSnapshot[$roleName]) ? $beforeSnapshot[$roleName] : array();
            foreach ($pages as $pageLabel => $newValue)
            {
                $oldValue = isset($beforePages[$pageLabel]) ? $beforePages[$pageLabel] : '(default)';
                if ($oldValue !== $newValue)
                {
                    $changes[] = $roleName . ' / ' . $pageLabel . ': ' . $oldValue . ' -> ' . $newValue;
                }
            }
        }

        if (empty($changes))
        {
            return;
        }

        $summary = implode(' | ', array_slice($changes, 0, 30));
        if (count($changes) > 30)
        {
            $summary .= ' | ...';
        }

        $payload = array(
            'siteID' => $this->_siteID,
            'userID' => $this->_userID,
            'changeCount' => count($changes),
            'changes' => $changes
        );
        error_log('RoleMatrixAudit | ' . json_encode($payload));

        $historySummary = '(USER) updated role access matrix. changes=' . count($changes) . '. ';
        $historySummary .= substr($summary, 0, 900);
        $history = new History($this->_siteID);
        $history->storeHistorySimple(
            DATA_ITEM_USER,
            $this->_userID,
            $historySummary
        );
    }

    private function buildRolePagePermissionsSnapshot($matrixData)
    {
        $snapshot = array();
        if (!isset($matrixData['roles']) || !isset($matrixData['pages']) || !isset($matrixData['matrix']))
        {
            return $snapshot;
        }

        foreach ($matrixData['roles'] as $role)
        {
            $roleID = (int) $role['roleID'];
            $roleName = $role['roleName'];
            $snapshot[$roleName] = array();

            foreach ($matrixData['pages'] as $pageKey => $pageData)
            {
                $pageLabel = $pageData['label'];
                $option = '';
                if (isset($matrixData['matrix'][$roleID]) &&
                    isset($matrixData['matrix'][$roleID][$pageKey]) &&
                    isset($matrixData['matrix'][$roleID][$pageKey]['option']))
                {
                    $option = $matrixData['matrix'][$roleID][$pageKey]['option'];
                }

                if ($option == '')
                {
                    $option = 'read';
                }

                $snapshot[$roleName][$pageLabel] = $option;
            }
        }

        return $snapshot;
    }

    /*
     * Called by handleRequest() to show the e-mail settings template.
     */
    private function emailSettings()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $mailerSettings = new MailerSettings($this->_siteID);
        $mailerSettingsRS = $mailerSettings->getAll();

        $candidateJoborderStatusSendsMessage = unserialize($mailerSettingsRS['candidateJoborderStatusSendsMessage']);
        if (!is_array($candidateJoborderStatusSendsMessage))
        {
            $candidateJoborderStatusSendsMessage = array();
        }

        $statusDefaults = array(
            PIPELINE_STATUS_ALLOCATED,
            PIPELINE_STATUS_DELIVERY_VALIDATED,
            PIPELINE_STATUS_PROPOSED_TO_CUSTOMER,
            PIPELINE_STATUS_CUSTOMER_INTERVIEW,
            PIPELINE_STATUS_CUSTOMER_APPROVED,
            PIPELINE_STATUS_AVEL_APPROVED,
            PIPELINE_STATUS_OFFER_NEGOTIATION,
            PIPELINE_STATUS_OFFER_ACCEPTED,
            PIPELINE_STATUS_HIRED,
            PIPELINE_STATUS_REJECTED
        );

        foreach ($statusDefaults as $statusID)
        {
            if (!isset($candidateJoborderStatusSendsMessage[$statusID]))
            {
                $candidateJoborderStatusSendsMessage[$statusID] = 0;
            }
        }

        $emailTemplates = new EmailTemplates($this->_siteID);
        $emailTemplatesRS = $emailTemplates->getAll();

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-email-settings')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernEmailSettingsJSON(
                'settings-email-settings',
                $mailerSettingsRS,
                $candidateJoborderStatusSendsMessage,
                $emailTemplatesRS,
                isset($_GET['saved'])
            );
            return;
        }

        $this->_template->assign('emailTemplatesRS', $emailTemplatesRS);
        $this->_template->assign('candidateJoborderStatusSendsMessage', $candidateJoborderStatusSendsMessage);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('mailerSettingsRS', $mailerSettingsRS);
        $this->_template->assign('sessionCookie', $_SESSION['CATS']->getCookie());
        $this->_template->display('./modules/settings/EmailSettings.tpl');
    }

    /*
     * Called by handleRequest() to process the e-mail settings template.
     */
    private function onEmailSettings()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $mailerSettings = new MailerSettings($this->_siteID);
        $mailerSettingsRS = $mailerSettings->getAll();

        foreach ($mailerSettingsRS as $setting => $value)
        {
            if (isset($_POST[$setting]))
            {
                $mailerSettings->set($setting, $_POST[$setting]);
            }
        }

        $candidateJoborderStatusSendsMessage = unserialize($mailerSettingsRS['candidateJoborderStatusSendsMessage']);

        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_ALLOCATED] = (UserInterface::isChecked('statusChangeAllocated', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_DELIVERY_VALIDATED] = (UserInterface::isChecked('statusChangeDeliveryValidated', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_PROPOSED_TO_CUSTOMER] = (UserInterface::isChecked('statusChangeProposedToCustomer', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_CUSTOMER_INTERVIEW] = (UserInterface::isChecked('statusChangeCustomerInterview', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_CUSTOMER_APPROVED] = (UserInterface::isChecked('statusChangeCustomerApproved', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_AVEL_APPROVED] = (UserInterface::isChecked('statusChangeAvelApproved', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_OFFER_NEGOTIATION] = (UserInterface::isChecked('statusChangeOfferNegotiation', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_OFFER_ACCEPTED] = (UserInterface::isChecked('statusChangeOfferAccepted', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_HIRED] = (UserInterface::isChecked('statusChangeHired', $_POST) ? 1 : 0);
        $candidateJoborderStatusSendsMessage[PIPELINE_STATUS_REJECTED] = (UserInterface::isChecked('statusChangeRejected', $_POST) ? 1 : 0);

        $mailerSettings->set('candidateJoborderStatusSendsMessage', serialize($candidateJoborderStatusSendsMessage));

        $emailTemplates = new EmailTemplates($this->_siteID);
        $emailTemplatesRS = $emailTemplates->getAll();

        foreach ($emailTemplatesRS as $index => $data)
        {
            $emailTemplates->updateIsActive($data['emailTemplateID'], (UserInterface::isChecked('useThisTemplate'.$data['emailTemplateID'], $_POST) ? 0 : 1));
        }

        if ($isModernJSON)
        {
            $this->renderModernMutationJSON(
                'settings.emailSettings.mutation.v1',
                'settings-email-settings',
                sprintf('%s?m=settings&a=emailSettings&ui=modern', CATSUtility::getIndexName()),
                true,
                'E-Mail settings saved.',
                array(
                    'legacyURL' => sprintf('%s?m=settings&a=emailSettings&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        $this->_template->assign('active', $this);
        CATSUtility::transferRelativeURI('m=settings&a=administration');
    }

    /*
     * Called by handleRequest() to show the customize calendar template.
     */
    private function customizeCalendar()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $calendarSettings = new CalendarSettings($this->_siteID);
        $calendarSettingsRS = $calendarSettings->getAll();

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-customize-calendar')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernCustomizeCalendarJSON(
                'settings-customize-calendar',
                $calendarSettingsRS
            );
            return;
        }

        $this->_template->assign('calendarSettingsRS', $calendarSettingsRS);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->display('./modules/settings/CustomizeCalendar.tpl');
    }


    /*
     * Called by handleRequest() to process the customize calendar template.
     */
    private function onCustomizeCalendar()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $calendarSettings = new CalendarSettings($this->_siteID);
        $calendarSettingsRS = $calendarSettings->getAll();

        foreach ($calendarSettingsRS as $setting => $value)
        {
            if ($setting == 'noAjax' || $setting == 'defaultPublic' || $setting == 'firstDayMonday')
            {
                if ($this->isChecked($setting, $_POST))
                {
                    $calendarSettings->set($setting, '1');
                }
                else
                {
                    $calendarSettings->set($setting, '0');
                }
            }
            else
            {
                if (isset($_POST[$setting]))
                {
                    $calendarSettings->set($setting, $_POST[$setting]);
                }
            }
        }

        if ($isModernJSON)
        {
            $this->renderModernMutationJSON(
                'settings.customizeCalendar.mutation.v1',
                'settings-customize-calendar',
                sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                true,
                'Calendar customization saved.',
                array(
                    'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                    'legacyURL' => sprintf('%s?m=settings&a=customizeCalendar&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        $this->_template->assign('active', $this);
        CATSUtility::transferRelativeURI('m=settings&a=administration');
    }

    /*
     * Called by handleRequest() to show the customize reports template.
     */
    private function reports()
    {
        $reportsSettings = new ReportsSettings($this->_siteID);
        $reportsSettingsRS = $reportsSettings->getAll();

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('reportsSettings', $reportsSettingsRS);
        $this->_template->assign('reportsSaved', isset($_GET['saved']));
        $this->_template->display('./modules/settings/CustomizeReports.tpl');
    }

    private function onReports()
    {
        $reportsSettings = new ReportsSettings($this->_siteID);

        $settingMap = array(
            ReportsSettings::SETTING_SLA_ACTIVITY_DAYS => 'SLA activity window must be a whole number between 1 and 30 days.',
            ReportsSettings::SETTING_RISK_NO_ACTIVITY_DAYS => 'No-activity risk threshold must be a whole number between 2 and 60 days.',
            ReportsSettings::SETTING_RISK_LONG_OPEN_DAYS => 'Long-open risk threshold must be a whole number between 5 and 180 days.',
            ReportsSettings::SETTING_RISK_LOW_COVERAGE_DAYS => 'Low-coverage threshold must be a whole number between 2 and 90 days.'
        );

        foreach ($settingMap as $settingName => $errorMessage)
        {
            $valueRaw = $this->getTrimmedInput($settingName, $_POST);
            if (!ctype_digit((string) $valueRaw))
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, $errorMessage);
            }

            $valueSanitized = $reportsSettings->sanitizeThresholdValue($settingName, $valueRaw);
            if ((int) $valueSanitized !== (int) $valueRaw)
            {
                CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, $errorMessage);
            }

            $reportsSettings->set($settingName, (string) $valueSanitized);
        }

        CATSUtility::transferRelativeURI('m=settings&a=reports&saved=1');
    }

    /*
     * Called by handleRequest() to process loading new site pages.
     */
    private function newInstallPassword()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-new-install-password')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernNewInstallPasswordJSON('settings-new-install-password');
            return;
        }

        $this->_template->assign('inputType', 'password');
        $this->_template->assign('title', 'Create Administrator Password');
        $this->_template->assign('prompt', 'Congratulations! You have successfully logged onto CATS for the first time. Please create a new administrator password. Note that you cannot use \'cats\' as a password.');
        $this->_template->assign('action', $this->getAction());
        $this->_template->assign('home', 'home');
        $this->_template->display('./modules/settings/NewInstallWizard.tpl');
    }

    private function newSiteName()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-new-site-name')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernNewSiteNameJSON('settings-new-site-name');
            return;
        }

        $this->_template->assign('inputType', 'siteName');
        $this->_template->assign('inputTypeTextParam', 'Please choose your site name.');
        $this->_template->assign('title', 'Site Name');
        $this->_template->assign('prompt', 'Your administrator password has been changed.<br /><br />Next, please create a name for your CATS installation (for example, MyCompany, Inc.). This will be displayed in the top right corner of all CATS pages.');
        $this->_template->assign('action', $this->getAction());
        $this->_template->assign('home', 'home');
        $this->_template->display('./modules/settings/NewInstallWizard.tpl');
    }

    private function upgradeSiteName()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-upgrade-site-name')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernUpgradeSiteNameJSON('settings-upgrade-site-name');
            return;
        }

        $this->_template->assign('inputType', 'siteName');
        $this->_template->assign('inputTypeTextParam', 'Site Name');
        $this->_template->assign('title', 'Site Name');
        $this->_template->assign('prompt', 'You have no site name defined. Please create a name for your CATS installation (for example, MyCompany, Inc.). This will be displayed in the top right corner of all CATS pages.');
        $this->_template->assign('action', $this->getAction());
        $this->_template->assign('home', 'home');
        $this->_template->display('./modules/settings/NewInstallWizard.tpl');
    }

    private function createBackup()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        /* Attachments */
        $attachments = new Attachments(CATS_ADMIN_SITE);
        $attachmentsRS = $attachments->getAll(
            DATA_ITEM_COMPANY, $_SESSION['CATS']->getSiteCompanyID()
        );

        foreach ($attachmentsRS as $index => $data)
        {
            $attachmentsRS[$index]['fileSize'] = FileUtility::sizeToHuman(
                filesize($data['retrievalURLLocal']), 2, 1
            );
        }

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-create-backup')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernCreateBackupJSON('settings-create-backup', $attachmentsRS);
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('attachmentsRS', $attachmentsRS);
        $this->_template->display('./modules/settings/Backup.tpl');
    }

    private function deleteBackup()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        if ($responseFormat === 'modern-json' && $modernPage !== '' && $modernPage !== 'settings-delete-backup')
        {
            $this->rejectUnsupportedModernPage($modernPage);
            return;
        }

        $attachments = new Attachments(CATS_ADMIN_SITE);
        $attachments->deleteAll(
            DATA_ITEM_COMPANY,
            $_SESSION['CATS']->getSiteCompanyID(),
            "AND content_type = 'catsbackup'"
        );

        if ($responseFormat === 'modern-json')
        {
            $this->renderModernMutationJSON(
                'settings.deleteBackup.mutation.v1',
                'settings-delete-backup',
                sprintf('%s?m=settings&a=createBackup&ui=modern', CATSUtility::getIndexName()),
                true,
                'Backup deleted.',
                array(
                    'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                    'legacyURL' => sprintf('%s?m=settings&a=deleteBackup&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=settings&a=createBackup');
    }

    private function forceEmail()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-force-email')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernForceEmailJSON(
                'settings-force-email',
                '',
                false
            );
            return;
        }

        $this->_template->assign('inputType', 'siteName');
        $this->_template->assign('inputTypeTextParam', 'E-Mail Address');
        $this->_template->assign('title', 'E-Mail Address');
        $this->_template->assign('prompt', 'CATS does not know what your e-mail address is for sending notifications. Please type your e-mail address in the box below.');
        $this->_template->assign('action', $this->getAction());
        $this->_template->assign('home', 'home');
        $this->_template->display('./modules/settings/NewInstallWizard.tpl');
    }

    private function onForceEmail()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $emailAddress = $this->getTrimmedInput('siteName', $_POST);

        if (empty($emailAddress))
        {
            if ($isModernJSON)
            {
                $this->renderModernMutationJSON(
                    'settings.forceEmail.mutation.v1',
                    'settings-force-email',
                    sprintf('%s?m=settings&a=forceEmail&ui=modern', CATSUtility::getIndexName()),
                    false,
                    'Please enter an e-mail address.',
                    array(
                        'legacyURL' => sprintf('%s?m=settings&a=forceEmail&ui=legacy', CATSUtility::getIndexName())
                    )
                );
                return;
            }

            $this->_template->assign('message', 'Please enter an e-mail address.');
            $this->_template->assign('messageSuccess', false);
            $this->forceEmail();
        }
        else
        {
            $site = new Users($this->_siteID);
            $site->updateSelfEmail($this->_userID, $emailAddress);

            $this->_template->assign('inputType', 'conclusion');
            $this->_template->assign('title', "E-Mail Address");
            $this->_template->assign('prompt', "Your e-mail settings have been saved. This concludes the CATS initial configuration wizard.");
            $this->_template->assign('action', $this->getAction());
            $this->_template->assign('home', 'home');

            if ($isModernJSON)
            {
                $this->renderModernMutationJSON(
                    'settings.forceEmail.mutation.v1',
                    'settings-force-email',
                    sprintf('%s?m=settings&a=forceEmail&ui=modern', CATSUtility::getIndexName()),
                    true,
                    'Your e-mail settings have been saved. This concludes the CATS initial configuration wizard.',
                    array(
                        'legacyURL' => sprintf('%s?m=settings&a=forceEmail&ui=legacy', CATSUtility::getIndexName())
                    )
                );
                return;
            }

            $this->_template->display('./modules/settings/NewInstallWizard.tpl');
        }
    }

    private function renderModernCustomizeCalendarJSON($modernPage, $calendarSettingsRS)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedSettings = array();
        foreach ($calendarSettingsRS as $setting => $value)
        {
            $normalizedSettings[$setting] = (string) $value;
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.customizeCalendar.v1',
                'modernPage' => $modernPage
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=customizeCalendar', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=customizeCalendar&ui=legacy', $baseURL)
            ),
            'settings' => $normalizedSettings,
            'calendarViewOptions' => array(
                array('value' => 'DAYVIEW', 'label' => 'Day View'),
                array('value' => 'WEEKVIEW', 'label' => 'Week View'),
                array('value' => 'MONTHVIEW', 'label' => 'Month View')
            ),
            'hourOptions' => $this->buildModernCalendarHourOptions()
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernEEOJSON($modernPage, $eeoSettingsRS)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedSettings = array();
        foreach ($eeoSettingsRS as $setting => $value)
        {
            $normalizedSettings[$setting] = (string) $value;
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.eeo.v1',
                'modernPage' => $modernPage
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=eeo', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=eeo&ui=legacy', $baseURL)
            ),
            'settings' => $normalizedSettings
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernTalentFitFlowSettingsJSON($modernPage, $tffSettingsRS, $tffSaved, $testOk, $testMessage)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedSettings = array();
        foreach ($tffSettingsRS as $setting => $value)
        {
            $normalizedSettings[$setting] = (string) $value;
        }

        $state = array(
            'saved' => (bool) $tffSaved
        );
        if ($testMessage !== null)
        {
            $state['testOk'] = (bool) $testOk;
            $state['testMessage'] = (string) $testMessage;
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.talentFitFlowSettings.v1',
                'modernPage' => $modernPage
            ),
            'state' => $state,
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=talentFitFlowSettings', $baseURL),
                'testURL' => sprintf('%s?m=settings&a=talentFitFlowSettings', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=talentFitFlowSettings&ui=legacy', $baseURL)
            ),
            'settings' => $normalizedSettings
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernTalentFitFlowSettingsMutationJSON(
        $success,
        $message,
        $routeURL,
        $saved,
        $testOk,
        $testMessage
    )
    {
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.talentFitFlowSettings.mutation.v1',
                'modernPage' => 'settings-talent-fit-flow-settings'
            ),
            'success' => (bool) $success,
            'message' => (string) $message,
            'state' => array(
                'saved' => (bool) $saved
            ),
            'actions' => array(
                'routeURL' => (string) $routeURL,
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                'legacyURL' => sprintf('%s?m=settings&a=talentFitFlowSettings&ui=legacy', CATSUtility::getIndexName()),
                'submitURL' => sprintf('%s?m=settings&a=talentFitFlowSettings', CATSUtility::getIndexName()),
                'testURL' => sprintf('%s?m=settings&a=talentFitFlowSettings', CATSUtility::getIndexName())
            )
        );

        if ($testMessage !== null)
        {
            $payload['state']['testOk'] = (bool) $testOk;
            $payload['state']['testMessage'] = (string) $testMessage;
        }

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernNewInstallPasswordJSON($modernPage)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.newInstallPassword.v1',
                'modernPage' => $modernPage
            ),
            'wizard' => array(
                'inputType' => 'password',
                'title' => 'Create Administrator Password',
                'prompt' => 'Congratulations! You have successfully logged onto CATS for the first time. Please create a new administrator password. Note that you cannot use \'cats\' as a password.',
                'home' => 'home'
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=newInstallPassword', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=newInstallPassword&ui=legacy', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernNewSiteNameJSON($modernPage)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.newSiteName.v1',
                'modernPage' => $modernPage
            ),
            'wizard' => array(
                'inputType' => 'siteName',
                'inputTypeTextParam' => 'Please choose your site name.',
                'title' => 'Site Name',
                'prompt' => 'Your administrator password has been changed. Next, please create a name for your CATS installation (for example, MyCompany, Inc.). This will be displayed in the top right corner of all CATS pages.',
                'home' => 'home'
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=newSiteName', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=newSiteName&ui=legacy', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernUpgradeSiteNameJSON($modernPage)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.upgradeSiteName.v1',
                'modernPage' => $modernPage
            ),
            'wizard' => array(
                'inputType' => 'siteName',
                'inputTypeTextParam' => 'Site Name',
                'title' => 'Site Name',
                'prompt' => 'You have no site name defined. Please create a name for your CATS installation (for example, MyCompany, Inc.). This will be displayed in the top right corner of all CATS pages.',
                'home' => 'home'
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=upgradeSiteName', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=upgradeSiteName&ui=legacy', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernCreateBackupJSON($modernPage, $attachmentsRS)
    {
        $baseURL = CATSUtility::getIndexName();
        $attachments = array();

        foreach ($attachmentsRS as $attachment)
        {
            $attachments[] = array(
                'retrievalURL' => isset($attachment['retrievalURL']) ? (string) $attachment['retrievalURL'] : '',
                'retrievalURLLocal' => isset($attachment['retrievalURLLocal']) ? (string) $attachment['retrievalURLLocal'] : '',
                'originalFilename' => isset($attachment['originalFilename']) ? (string) $attachment['originalFilename'] : '',
                'fileSize' => isset($attachment['fileSize']) ? (string) $attachment['fileSize'] : '',
                'dateCreated' => isset($attachment['dateCreated']) ? (string) $attachment['dateCreated'] : ''
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.createBackup.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'attachmentCount' => count($attachments)
            ),
            'actions' => array(
                'backupAjaxURL' => sprintf('%s?f=settings:backup', $baseURL),
                'deleteBackupURL' => sprintf('%s?m=settings&a=deleteBackup&ui=modern', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=createBackup&ui=legacy', $baseURL)
            ),
            'attachments' => $attachments
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernCustomizeExtraFieldsJSON($modernPage, $candidatesRS, $contactsRS, $companiesRS, $jobOrdersRS, $extraFieldTypes)
    {
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.customizeExtraFields.v1',
                'modernPage' => $modernPage
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=customizeExtraFields', CATSUtility::getIndexName()),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', CATSUtility::getIndexName()),
                'legacyURL' => sprintf('%s?m=settings&a=customizeExtraFields&ui=legacy', CATSUtility::getIndexName())
            ),
            'extraFieldSettings' => array(
                'candidates' => $candidatesRS,
                'contacts' => $contactsRS,
                'companies' => $companiesRS,
                'jobOrders' => $jobOrdersRS
            ),
            'extraFieldTypes' => $extraFieldTypes
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernNewInstallFinishedJSON($modernPage, $prompt, $showEmailWarning)
    {
        $baseURL = CATSUtility::getIndexName();
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.newInstallFinished.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'showEmailWarning' => (bool) $showEmailWarning
            ),
            'summary' => array(
                'title' => 'Settings Saved',
                'prompt' => (string) $prompt,
                'home' => 'home'
            ),
            'actions' => array(
                'homeURL' => sprintf('%s?m=home&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=newInstallFinished&ui=legacy', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function buildModernCalendarHourOptions()
    {
        $options = array();
        for ($hour = 0; $hour < 24; $hour++)
        {
            $displayHour = $hour % 12;
            if ($displayHour === 0)
            {
                $displayHour = 12;
            }

            $options[] = array(
                'value' => (string) $hour,
                'label' => sprintf('%d %s', $displayHour, ($hour < 12 ? 'AM' : 'PM'))
            );
        }

        return $options;
    }

    private function newInstallFinished()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        NewVersionCheck::checkForUpdate();

        $accessLevel = $_SESSION['CATS']->getAccessLevel(ACL::SECOBJ_ROOT);

        $mailerSettings = new MailerSettings($this->_siteID);
        $mailerSettingsRS = $mailerSettings->getAll();
        $showEmailWarning = ($mailerSettingsRS['configured'] == '0' &&
            $accessLevel >= ACCESS_LEVEL_SA);
        $prompt = 'Your site name has been saved. This concludes the required CATS configuration wizard.';
        $modernPrompt = 'Your site name has been saved. This concludes the required CATS configuration wizard.';

        $this->_template->assign('inputType', 'conclusion');
        $this->_template->assign('title', 'Settings Saved');

        if ($showEmailWarning)
        {
            $prompt = 'Your site name has been saved. This concludes the required CATS configuration wizard.<BR><BR><span style="font-weight: bold;">Warning:</span><BR><BR> E-mail features are disabled. In order to enable e-mail features (such as e-mail notifications), please configure your e-mail settings by clicking on the Settings tab and then clicking on Administration.';
            $modernPrompt = 'Your site name has been saved. This concludes the required CATS configuration wizard. E-mail features are disabled. In order to enable e-mail features (such as e-mail notifications), please configure your e-mail settings by clicking on the Settings tab and then clicking on Administration.';
        }

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-new-install-finished')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernNewInstallFinishedJSON(
                'settings-new-install-finished',
                $modernPrompt,
                $showEmailWarning
            );
            return;
        }

        $this->_template->assign('prompt', $prompt);
        $this->_template->assign('action', $this->getAction());
        $this->_template->assign('home', 'home');
        $this->_template->display('./modules/settings/NewInstallWizard.tpl');
    }

    /*
     * Called by handleRequest() to process handling new site pages.
     */
    private function onNewInstallPassword()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $error = '';

        $newPassword = $this->getTrimmedInput(
            'password1',
            $_POST
        );
        $retypeNewPassword = $this->getTrimmedInput(
            'password2',
            $_POST
        );

        /* Bail out if the two passwords don't match. */
        if ($retypeNewPassword !== $newPassword)
        {
            $error = 'New passwords do not match.';
        }

        /* Bail out if the password is 'cats'. */
        if ($newPassword == 'cats')
        {
            $error = 'New password cannot equal \'cats\'.';
        }

        /* Attempt to change the user's password. */
        if (!$error)
        {
            $users = new Users($this->_siteID);
            if ($users->changePassword($this->_userID, 'cats', $newPassword) != LOGIN_SUCCESS)
            {
                $error = 'Unable to reset password.';
            }
        }

        if ($error)
        {
            if ($isModernJSON)
            {
                $this->renderModernMutationJSON(
                    'settings.newInstallPassword.mutation.v1',
                    'settings-new-install-password',
                    sprintf('%s?m=settings&a=newInstallPassword&ui=modern', CATSUtility::getIndexName()),
                    false,
                    $error,
                    array(
                        'legacyURL' => sprintf('%s?m=settings&a=newInstallPassword&ui=legacy', CATSUtility::getIndexName())
                    )
                );
                return;
            }

            $this->_template->assign('message', $error);
            $this->_template->assign('messageSuccess', false);
            $this->newInstallPassword();
        }
        else
        {
            if ($isModernJSON)
            {
                $this->renderModernMutationJSON(
                    'settings.newInstallPassword.mutation.v1',
                    'settings-new-install-password',
                    sprintf('%s?m=settings&a=newSiteName&ui=modern', CATSUtility::getIndexName()),
                    true,
                    'Administrator password saved.',
                    array(
                        'legacyURL' => sprintf('%s?m=settings&a=newInstallPassword&ui=legacy', CATSUtility::getIndexName())
                    )
                );
                return;
            }

            CATSUtility::transferRelativeURI('m=settings&a=newSiteName');
        }
    }

    private function onNewSiteName()
    {
        $isModernJSON = (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json');
        $routeAction = strtolower($this->getAction());
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_REQUEST));
        $expectedModernPage = ($routeAction === 'upgradesitename') ? 'settings-upgrade-site-name' : 'settings-new-site-name';
        $modernContractKey = ($routeAction === 'upgradesitename')
            ? 'settings.upgradeSiteName.mutation.v1'
            : 'settings.newSiteName.mutation.v1';
        $modernRouteURL = ($routeAction === 'upgradesitename')
            ? sprintf('%s?m=settings&a=upgradeSiteName&ui=modern', CATSUtility::getIndexName())
            : sprintf('%s?m=settings&a=newSiteName&ui=modern', CATSUtility::getIndexName());
        $modernLegacyURL = ($routeAction === 'upgradesitename')
            ? sprintf('%s?m=settings&a=upgradeSiteName&ui=legacy', CATSUtility::getIndexName())
            : sprintf('%s?m=settings&a=newSiteName&ui=legacy', CATSUtility::getIndexName());
        $newSiteName = $this->getTrimmedInput('siteName', $_POST);

        if ($isModernJSON && $modernPage !== '' && $modernPage !== $expectedModernPage)
        {
            $this->rejectUnsupportedModernPage($modernPage);
            return;
        }

        if (empty($newSiteName) || $newSiteName === 'default_site')
        {
            if ($isModernJSON)
            {
                $this->renderModernMutationJSON(
                    $modernContractKey,
                    $expectedModernPage,
                    $modernRouteURL,
                    false,
                    'Please enter a site name.',
                    array(
                        'legacyURL' => $modernLegacyURL
                    )
                );
                return;
            }

            $this->_template->assign('message', "Please enter a site name.");
            $this->_template->assign('messageSuccess', false);
            $this->upgradeSiteName();
        }
        else
        {
            $site = new Site($this->_siteID);
            $site->setName($newSiteName);

            $companies = new Companies($this->_siteID);
            $companyIDInternal = $companies->add(
                'Internal Postings', '', '', '', '', '', '', '', '', '', '',
                '', '', 'Internal postings.', $this->_userID, $this->_userID
            );

            $companies->setCompanyDefault($companyIDInternal);

            $_SESSION['CATS']->setSiteName($newSiteName);

            /* If no E-Mail set for current user, make user set E-Mail address. */
            if (trim($_SESSION['CATS']->getEmail()) == '')
            {
                if ($isModernJSON)
                {
                    $this->renderModernMutationJSON(
                        $modernContractKey,
                        $expectedModernPage,
                        sprintf('%s?m=settings&a=forceEmail&ui=modern', CATSUtility::getIndexName()),
                        true,
                        'Site name saved. E-mail address is required to finish setup.',
                        array(
                            'legacyURL' => $modernLegacyURL
                        )
                    );
                    return;
                }

                CATSUtility::transferRelativeURI('m=settings&a=forceEmail');
            }
            else
            {
                if ($isModernJSON)
                {
                    $this->renderModernMutationJSON(
                        $modernContractKey,
                        $expectedModernPage,
                        sprintf('%s?m=settings&a=newInstallFinished&ui=modern', CATSUtility::getIndexName()),
                        true,
                        'Site name saved.',
                        array(
                            'legacyURL' => $modernLegacyURL
                        )
                    );
                    return;
                }

                CATSUtility::transferRelativeURI('m=settings&a=newInstallFinished');
            }
        }
    }

    private function onNewInstallFinished()
    {
        if (strtolower($this->getTrimmedInput('format', $_REQUEST)) === 'modern-json')
        {
            $modernPage = strtolower($this->getTrimmedInput('modernPage', $_REQUEST));
            if ($modernPage !== '' && $modernPage !== 'settings-new-install-finished')
            {
                $this->rejectUnsupportedModernPage($modernPage);
                return;
            }

            $this->renderModernMutationJSON(
                'settings.newInstallFinished.mutation.v1',
                'settings-new-install-finished',
                sprintf('%s?m=home&ui=modern', CATSUtility::getIndexName()),
                true,
                'Setup complete.',
                array(
                    'legacyURL' => sprintf('%s?m=settings&a=newInstallFinished&ui=legacy', CATSUtility::getIndexName())
                )
            );
            return;
        }

        CATSUtility::transferRelativeURI('m=home');
    }

    /*
     * Called by handleRequest() to process loading the administration page.
     */
    private function administration()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $requestedSubpage = strtolower($this->getTrimmedInput('s', $_GET));
        $message = $this->getTrimmedInput('message', $_GET);
        $messageSuccess = $this->getTrimmedInput('messageSuccess', $_GET);

        $systemInfo = new SystemInfo();
        $systemInfoData = $systemInfo->getSystemInfo();

        if (isset($systemInfoData['available_version']) && $systemInfoData['available_version'] > CATSUtility::getVersionAsInteger())
        {
            $newVersion = true;
        }
        else
        {
            $newVersion = false;
        }

        if (isset($systemInfoData['disable_version_check']) && $systemInfoData['disable_version_check'])
        {
            $versionCheckPref = false;
        }
        else
        {
            $versionCheckPref = true;
        }

        if ($this->getUserAccessLevel('settings.administration') >= ACCESS_LEVEL_ROOT || $this->getUserAccessLevel('settings.administration') == ACCESS_LEVEL_DEMO)
        {
            $systemAdministration = true;
        }
        else
        {
            $systemAdministration = false;
        }

        $rolePagePermissions = new RolePagePermissions($this->_siteID);
        $rolePermissionsEnabled = $rolePagePermissions->isSchemaAvailable() ? 1 : 0;
        $careerPortalUnlock = false;
        $careerPortalSettings = new CareerPortalSettings($this->_siteID);
        $cpData = $careerPortalSettings->getAll();
        if (intval($cpData['enabled']) || !$_SESSION['CATS']->isFree() ||
            LicenseUtility::isProfessional())
        {
            $careerPortalUnlock = true;
        }

        $totalCandidates = 0;
        $candidates = new Candidates($this->_siteID);
        $totalCandidates = $candidates->getCount();

        if ($responseFormat === 'modern-json')
        {
            if ($requestedSubpage === '')
            {
                if ($modernPage !== '' && $modernPage !== 'settings-administration')
                {
                    if (!headers_sent())
                    {
                        header('HTTP/1.1 400 Bad Request');
                        header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                    }
                    echo json_encode(array(
                        'error' => true,
                        'message' => 'Unsupported modern page contract.',
                        'requestedPage' => $modernPage
                    ));
                    return;
                }

                $this->renderModernAdministrationJSON(
                    'settings-administration',
                    $systemInfoData,
                    $newVersion,
                    $versionCheckPref,
                    $systemAdministration,
                    $careerPortalUnlock,
                    $rolePermissionsEnabled,
                    $totalCandidates,
                    $message,
                    $messageSuccess
                );
                return;
            }

        }

        // FIXME: 's' isn't a good variable name.
        if (isset($_GET['s']))
        {
            switch($_GET['s'])
            {
                case 'siteName':
                    $templateFile = './modules/settings/SiteName.tpl';
                    break;

                case 'newVersionCheck':
                    if (!$systemAdministration)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for administration.');
                    }

                    $this->_template->assign('versionCheckPref', $versionCheckPref);
                    $this->_template->assign('availableVersion', $systemInfoData['available_version']);
                    $this->_template->assign('newVersion', $newVersion);
                    $this->_template->assign('newVersionNews', NewVersionCheck::getNews());
                    $templateFile = './modules/settings/NewVersionCheck.tpl';
                    break;

                case 'passwords':
                    if (!$systemAdministration)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for administration.');
                    }

                    $templateFile = './modules/settings/Passwords.tpl';
                    break;

                case 'localization':
                    if ($this->getUserAccessLevel('settings.administration.localization') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for administration.');
                    }

                    $this->_template->assign('timeZone', $_SESSION['CATS']->getTimeZone());
                    $this->_template->assign('isDateDMY', $_SESSION['CATS']->isDateDMY());
                    $templateFile = './modules/settings/Localization.tpl';
                    break;

                case 'systemInformation':
                    if ($this->getUserAccessLevel('settings.administration.systemInformation') < ACCESS_LEVEL_SA)
                    {
                        CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for administration.');
                    }

                    $db = DatabaseConnection::getInstance();
                    $databaseVersion = $db->getRDBMSVersion();

                    $installationDirectory = realpath('./');

                    if (SystemUtility::isWindows())
                    {
                        $OSType = 'Windows';
                    }
                    else if (SystemUtility::isMacOSX())
                    {
                        $OSType = 'Mac OS X';
                    }
                    else
                    {
                        $OSType = 'UNIX';
                    }

                    $schemaVersions = ModuleUtility::getModuleSchemaVersions();

                    $this->_template->assign('databaseVersion', $databaseVersion);
                    $this->_template->assign('installationDirectory', $installationDirectory);
                    $this->_template->assign('OSType', $OSType);
                    $this->_template->assign('schemaVersions', $schemaVersions);
                    $templateFile = './modules/settings/SystemInformation.tpl';
                    break;

                default:
                    $templateFile = './modules/settings/Administration.tpl';
                    break;
            }
        }
        else
        {
            $templateFile = './modules/settings/Administration.tpl';

            /* Load extra settings. */
            $extraSettings = array();

            $modules = ModuleUtility::getModules();
            foreach ($modules as $moduleName => $parameters)
            {
                $extraSettingsModule = $parameters[MODULE_SETTINGS_ENTRIES];

                if ($extraSettingsModule != false)
                {
                    foreach ($extraSettingsModule as $extraSettingsModuleData)
                    {
                        if ($extraSettingsModuleData[2] <= $this->_realAccessLevel)
                        {
                            $extraSettings[] = $extraSettingsModuleData;
                        }
                    }
                }
            }
            $this->_template->assign('extraSettings', $extraSettings);
        }

        if (!strcmp($templateFile, './modules/settings/Administration.tpl'))
        {
            // Highlight certain rows of importance based on criteria
            $this->_template->assign('totalCandidates', $candidates->getCount());
        }

        if (!eval(Hooks::get('SETTINGS_DISPLAY_ADMINISTRATION'))) return;

        $this->_template->assign('careerPortalUnlock', $careerPortalUnlock);
        $this->_template->assign('rolePermissionsEnabled', $rolePermissionsEnabled);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('systemAdministration', $systemAdministration);
        $this->_template->assign('active', $this);
        $this->_template->display($templateFile);
    }

    private function schemaMigrations()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $indexByVersion = array();
        $dirMissing = false;
        $migrations = $this->loadSchemaMigrations($indexByVersion, $dirMissing);

        $pendingCount = 0;
        foreach ($migrations as $migration)
        {
            if (!$migration['applied'])
            {
                $pendingCount++;
            }
        }

        $message = $this->getTrimmedInput('message', $_GET);
        $errorMessage = $this->getTrimmedInput('error', $_GET);

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-schema-migrations')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernSchemaMigrationsJSON(
                'settings-schema-migrations',
                $migrations,
                $pendingCount,
                $dirMissing ? 1 : 0,
                $message,
                $errorMessage
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('migrations', $migrations);
        $this->_template->assign('pendingCount', $pendingCount);
        $this->_template->assign('dirMissing', $dirMissing ? 1 : 0);
        $this->_template->assign('message', $message);
        $this->_template->assign('errorMessage', $errorMessage);

        $this->_template->display('./modules/settings/SchemaMigrations.tpl');
    }

    private function onSchemaMigrations()
    {
        $version = $this->getTrimmedInput('version', $_POST);
        $applyAll = (isset($_POST['applyAll']) && $_POST['applyAll'] !== '');
        $markApplied = (isset($_POST['markApplied']) && $_POST['markApplied'] !== '');
        $this->logMigrationEvent('request_received', array(
            'version' => $version,
            'applyAll' => $applyAll ? 1 : 0,
            'markApplied' => $markApplied ? 1 : 0
        ));

        $indexByVersion = array();
        $dirMissing = false;
        $migrations = $this->loadSchemaMigrations($indexByVersion, $dirMissing);

        if ($dirMissing)
        {
            $this->logMigrationEvent('migrations_directory_missing');
            CommonErrors::fatal(COMMONERROR_FILEERROR, $this, 'Migrations directory not found.');
        }

        $db = DatabaseConnection::getInstance();
        $this->ensureSchemaMigrationsTable($db);

        if (defined('CATS_SLAVE') && CATS_SLAVE)
        {
            $this->logMigrationEvent('apply_blocked_slave_mode');
            CommonErrors::fatal(
                COMMONERROR_BADFIELDS,
                $this,
                'Schema migrations are blocked because CATS is running in slave/read-only mode (CATS_SLAVE=true).'
            );
        }

        if ($markApplied)
        {
            if ($version === '' || !isset($indexByVersion[$version]))
            {
                $this->logMigrationEvent('mark_applied_invalid_version', array('version' => $version));
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid migration selection.');
            }

            $migration = $indexByVersion[$version];
            if ($migration['applied'])
            {
                $this->logMigrationEvent('mark_applied_already_applied', array('version' => $version));
                CATSUtility::transferRelativeURI('m=settings&a=schemaMigrations&message=' . urlencode('Migration already applied.'));
            }

            $verificationMessage = '';
            if (!$this->verifySchemaMigrationPrereq($version, $db, $verificationMessage))
            {
                $this->logMigrationEvent('mark_applied_verification_failed', array(
                    'version' => $version,
                    'details' => $verificationMessage
                ));
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, $verificationMessage);
            }
            $this->logMigrationEvent('mark_applied_verification_ok', array(
                'version' => $version,
                'details' => $verificationMessage
            ));

            $lockRS = $db->getAssoc(sprintf(
                "SELECT GET_LOCK(%s, %s) AS gotLock",
                $db->makeQueryString('opencats_migrate'),
                $db->makeQueryInteger(60)
            ));

            if (empty($lockRS) || (int) $lockRS['gotLock'] !== 1)
            {
                $this->logMigrationEvent('mark_applied_lock_failed', array('version' => $version));
                CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to acquire migration lock.');
            }

            $insertSQL = $this->buildSchemaMigrationInsertSQL(
                $db,
                $migration['version'],
                $migration['checksum'],
                'admin-ui'
            );
            $insert = $db->query($insertSQL, true);
            $insertError = ($insert === false) ? $db->getError() : '';
            $dbState = ($insert === false) ? $this->getMigrationDBState($db) : array();

            $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString('opencats_migrate')));

            if ($insert === false)
            {
                $this->logMigrationEvent('mark_applied_insert_failed', array(
                    'version' => $version,
                    'dbError' => $insertError,
                    'dbState' => $dbState,
                    'insertSQL' => substr(preg_replace('/\s+/', ' ', $insertSQL), 0, 240)
                ));
                CommonErrors::fatal(
                    COMMONERROR_RECORDERROR,
                    $this,
                    $this->buildMigrationFailureDetails(
                        'mark_applied_insert_failed',
                        $migration,
                        $db,
                        $insertError,
                        $insertSQL,
                        $dbState
                    )
                );
            }
            $this->logMigrationEvent('mark_applied_completed', array('version' => $version));

            $message = 'Migration marked as applied.';
            if ($verificationMessage !== '')
            {
                $message .= ' ' . $verificationMessage;
            }
            CATSUtility::transferRelativeURI('m=settings&a=schemaMigrations&message=' . urlencode($message));
        }

        $toApply = array();
        if ($applyAll)
        {
            foreach ($migrations as $migration)
            {
                if (!$migration['applied'])
                {
                    $toApply[] = $migration;
                }
            }
            if (empty($toApply))
            {
                $this->logMigrationEvent('apply_all_no_pending');
                CATSUtility::transferRelativeURI('m=settings&a=schemaMigrations&message=' . urlencode('No pending migrations.'));
            }
        }
        else
        {
            if ($version === '' || !isset($indexByVersion[$version]))
            {
                $this->logMigrationEvent('apply_single_invalid_version', array('version' => $version));
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid migration selection.');
            }
            $migration = $indexByVersion[$version];
            if ($migration['applied'])
            {
                $this->logMigrationEvent('apply_single_already_applied', array('version' => $version));
                CATSUtility::transferRelativeURI('m=settings&a=schemaMigrations&message=' . urlencode('Migration already applied.'));
            }
            $toApply[] = $migration;
        }
        $this->logMigrationEvent('apply_migrations_selected', array('count' => count($toApply)));

        $lockRS = $db->getAssoc(sprintf(
            "SELECT GET_LOCK(%s, %s) AS gotLock",
            $db->makeQueryString('opencats_migrate'),
            $db->makeQueryInteger(60)
        ));

        if (empty($lockRS) || (int) $lockRS['gotLock'] !== 1)
        {
            $this->logMigrationEvent('apply_lock_failed');
            CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, 'Failed to acquire migration lock.');
        }
        $this->logMigrationEvent('apply_lock_acquired');

        $appliedCount = 0;
        $verificationLogs = array();
        foreach ($toApply as $migration)
        {
            $this->logMigrationEvent('apply_migration_started', array('version' => $migration['version']));
            $sql = file_get_contents($migration['file']);
            if ($sql === false)
            {
                $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString('opencats_migrate')));
                $this->logMigrationEvent('apply_migration_read_failed', array('version' => $migration['version']));
                CommonErrors::fatal(COMMONERROR_FILEERROR, $this, 'Failed to read migration file.');
            }

            $statements = $this->splitMigrationSqlStatements($sql);
            $this->logMigrationEvent('apply_migration_statements_parsed', array(
                'version' => $migration['version'],
                'statementCount' => count($statements)
            ));
            foreach ($statements as $statementIndex => $statement)
            {
                $statement = $this->normalizeMigrationStatement($statement);
                if ($statement === '')
                {
                    continue;
                }
                $result = $db->query($statement, true);
                if ($result === false)
                {
                    $dbError = $db->getError();
                    $statementPreview = substr(preg_replace('/\s+/', ' ', $statement), 0, 200);
                    $failureDetails = 'Migration query failed at statement #' . ($statementIndex + 1)
                        . '. Query: ' . $statementPreview . '. DB: ' . $dbError;
                    if (defined('CATS_SLAVE') && CATS_SLAVE && strpos($dbError, 'errno: 0') !== false)
                    {
                        $failureDetails .= ' Writes are blocked because CATS_SLAVE is enabled in config.php.';
                    }
                    $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString('opencats_migrate')));
                    $this->logMigrationEvent('apply_migration_query_failed', array(
                        'version' => $migration['version'],
                        'statementIndex' => $statementIndex + 1,
                        'statementPreview' => $statementPreview,
                        'dbError' => $dbError
                    ));
                    CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, $failureDetails);
                }
            }

            $verificationMessage = '';
            if (!$this->verifySchemaMigrationPrereq($migration['version'], $db, $verificationMessage))
            {
                $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString('opencats_migrate')));
                $this->logMigrationEvent('apply_migration_verification_failed', array(
                    'version' => $migration['version'],
                    'details' => $verificationMessage
                ));
                CommonErrors::fatal(COMMONERROR_RECORDERROR, $this, $verificationMessage);
            }
            if ($verificationMessage !== '')
            {
                $verificationLogs[] = $verificationMessage;
                $this->logMigrationEvent('apply_migration_verification_ok', array(
                    'version' => $migration['version'],
                    'details' => $verificationMessage
                ));
            }

            $insertSQL = $this->buildSchemaMigrationInsertSQL(
                $db,
                $migration['version'],
                $migration['checksum'],
                'admin-ui'
            );
            $insert = $db->query($insertSQL, true);
            $insertError = ($insert === false) ? $db->getError() : '';
            $dbState = ($insert === false) ? $this->getMigrationDBState($db) : array();

            if ($insert === false)
            {
                $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString('opencats_migrate')));
                $this->logMigrationEvent('apply_migration_record_failed', array(
                    'version' => $migration['version'],
                    'dbError' => $insertError,
                    'dbState' => $dbState,
                    'insertSQL' => substr(preg_replace('/\s+/', ' ', $insertSQL), 0, 240)
                ));
                CommonErrors::fatal(
                    COMMONERROR_RECORDERROR,
                    $this,
                    $this->buildMigrationFailureDetails(
                        'apply_migration_record_failed',
                        $migration,
                        $db,
                        $insertError,
                        $insertSQL,
                        $dbState
                    )
                );
            }

            $appliedCount++;
            $this->logMigrationEvent('apply_migration_completed', array('version' => $migration['version']));
        }

        $db->query(sprintf("SELECT RELEASE_LOCK(%s)", $db->makeQueryString('opencats_migrate')));
        $this->logMigrationEvent('apply_lock_released');

        $message = ($appliedCount === 1)
            ? 'Applied 1 migration.'
            : 'Applied ' . $appliedCount . ' migrations.';
        if (!empty($verificationLogs))
        {
            $message .= ' ' . implode(' ', array_unique($verificationLogs));
        }
        $this->logMigrationEvent('apply_completed', array(
            'appliedCount' => $appliedCount,
            'message' => $message
        ));
        CATSUtility::transferRelativeURI('m=settings&a=schemaMigrations&message=' . urlencode($message));
    }

    private function ensureSchemaMigrationsTable($db)
    {
        $tables = $db->getAllAssoc("SHOW TABLES LIKE 'schema_migrations'");
        if (empty($tables))
        {
            $db->query(
                "CREATE TABLE IF NOT EXISTS schema_migrations (
                    id INT(11) NOT NULL AUTO_INCREMENT,
                    version VARCHAR(255) NOT NULL,
                    checksum CHAR(64) DEFAULT NULL,
                    applied_at DATETIME NOT NULL,
                    applied_by VARCHAR(64) NOT NULL,
                    PRIMARY KEY (id),
                    UNIQUE KEY uniq_version (version)
                ) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci"
            );
            return;
        }

        $columns = $db->getAllAssoc("SHOW COLUMNS FROM schema_migrations");
        $columnNames = array();
        foreach ($columns as $column)
        {
            $columnNames[$column['Field']] = true;
        }

        if (!isset($columnNames['version']))
        {
            $db->query("ALTER TABLE schema_migrations ADD COLUMN version VARCHAR(255) NOT NULL");
        }
        if (!isset($columnNames['checksum']))
        {
            $db->query("ALTER TABLE schema_migrations ADD COLUMN checksum CHAR(64) DEFAULT NULL");
        }
        if (!isset($columnNames['applied_at']))
        {
            $db->query("ALTER TABLE schema_migrations ADD COLUMN applied_at DATETIME NOT NULL");
        }
        if (!isset($columnNames['applied_by']))
        {
            $db->query("ALTER TABLE schema_migrations ADD COLUMN applied_by VARCHAR(64) NOT NULL");
        }

        $indexes = $db->getAllAssoc("SHOW INDEX FROM schema_migrations");
        $indexNames = array();
        foreach ($indexes as $index)
        {
            $indexNames[$index['Key_name']] = true;
        }
        if (!isset($indexNames['uniq_version']))
        {
            $db->query("CREATE UNIQUE INDEX uniq_version ON schema_migrations (version)");
        }
    }

    private function loadSchemaMigrations(&$indexByVersion, &$dirMissing)
    {
        $indexByVersion = array();
        $dirMissing = false;

        $migrationsDir = LEGACY_ROOT . '/migrations';
        if (!is_dir($migrationsDir))
        {
            $dirMissing = true;
            return array();
        }

        $db = DatabaseConnection::getInstance();
        $this->ensureSchemaMigrationsTable($db);

        $applied = array();
        $hasFilenameColumn = $this->schemaMigrationsHasColumn($db, 'filename');
        if ($hasFilenameColumn)
        {
            $appliedRows = $db->getAllAssoc(
                "SELECT
                    version,
                    filename,
                    checksum,
                    applied_at,
                    applied_by
                 FROM
                    schema_migrations"
            );
        }
        else
        {
            $appliedRows = $db->getAllAssoc("SELECT version, checksum, applied_at, applied_by FROM schema_migrations");
        }
        foreach ($appliedRows as $row)
        {
            $appliedVersion = '';
            if (isset($row['version']) && trim((string) $row['version']) !== '')
            {
                $appliedVersion = trim((string) $row['version']);
            }
            else if ($hasFilenameColumn && isset($row['filename']) && trim((string) $row['filename']) !== '')
            {
                $appliedVersion = trim((string) $row['filename']);
            }

            if ($appliedVersion !== '')
            {
                $row['version'] = $appliedVersion;
                $applied[$appliedVersion] = $row;
            }
        }

        $files = glob($migrationsDir . '/*.sql');
        if (!is_array($files))
        {
            $files = array();
        }
        sort($files, SORT_STRING);

        $list = array();
        foreach ($files as $file)
        {
            $version = basename($file);
            $checksum = hash_file('sha256', $file);
            $appliedRow = isset($applied[$version]) ? $applied[$version] : null;
            $isApplied = ($appliedRow !== null);
            $checksumMatches = true;
            if ($isApplied && !empty($appliedRow['checksum']) && $appliedRow['checksum'] !== $checksum)
            {
                $checksumMatches = false;
            }

            $row = array(
                'version' => $version,
                'file' => $file,
                'checksum' => $checksum,
                'applied' => $isApplied ? 1 : 0,
                'appliedAt' => $isApplied ? $appliedRow['applied_at'] : '',
                'appliedBy' => $isApplied ? $appliedRow['applied_by'] : '',
                'checksumMatches' => $checksumMatches ? 1 : 0
            );

            $list[] = $row;
            $indexByVersion[$version] = $row;
        }

        return $list;
    }

    private function schemaMigrationsHasColumn($db, $columnName)
    {
        $columnName = trim((string) $columnName);
        if ($columnName === '')
        {
            return false;
        }

        $columns = $db->getAllAssoc(
            "SHOW COLUMNS FROM schema_migrations LIKE " . $db->makeQueryString($columnName)
        );
        return !empty($columns);
    }

    private function buildSchemaMigrationInsertSQL($db, $version, $checksum, $appliedBy)
    {
        $hasFilenameColumn = $this->schemaMigrationsHasColumn($db, 'filename');
        if ($hasFilenameColumn)
        {
            return sprintf(
                "INSERT INTO schema_migrations (filename, version, checksum, applied_at, applied_by)
                 VALUES (%s, %s, %s, NOW(), %s)",
                $db->makeQueryString($version),
                $db->makeQueryString($version),
                $db->makeQueryString($checksum),
                $db->makeQueryString($appliedBy)
            );
        }

        return sprintf(
            "INSERT INTO schema_migrations (version, checksum, applied_at, applied_by)
             VALUES (%s, %s, NOW(), %s)",
            $db->makeQueryString($version),
            $db->makeQueryString($checksum),
            $db->makeQueryString($appliedBy)
        );
    }

    private function splitMigrationSqlStatements($sql)
    {
        $statements = array();
        $buffer = '';
        $inString = false;
        $stringChar = '';
        $len = strlen($sql);
        for ($i = 0; $i < $len; $i++)
        {
            $ch = $sql[$i];
            if ($inString)
            {
                if ($ch === $stringChar && ($i === 0 || $sql[$i - 1] !== '\\'))
                {
                    $inString = false;
                }
                $buffer .= $ch;
                continue;
            }

            if ($ch === '\'' || $ch === '"')
            {
                $inString = true;
                $stringChar = $ch;
                $buffer .= $ch;
                continue;
            }

            if ($ch === ';')
            {
                $statements[] = $buffer;
                $buffer = '';
                continue;
            }

            $buffer .= $ch;
        }

        if (trim($buffer) !== '')
        {
            $statements[] = $buffer;
        }

        return $statements;
    }

    private function normalizeMigrationStatement($statement)
    {
        $statement = str_replace("\r\n", "\n", $statement);
        $lines = explode("\n", $statement);
        $normalizedLines = array();

        foreach ($lines as $line)
        {
            $trimmedLine = trim($line);
            if ($trimmedLine === '')
            {
                $normalizedLines[] = $line;
                continue;
            }

            if (strpos($trimmedLine, '--') === 0 || strpos($trimmedLine, '#') === 0)
            {
                continue;
            }

            $normalizedLines[] = $line;
        }

        return trim(implode("\n", $normalizedLines));
    }

    private function verifySchemaMigrationPrereq($version, $db, &$message)
    {
        $message = '';

        if ($version === '202602101500_add_entered_by.sql')
        {
            $columns = $db->getAllAssoc("SHOW COLUMNS FROM candidate_joborder_status_history LIKE 'entered_by'");
            if (empty($columns))
            {
                $message = 'entered_by column not found; migration verification failed.';
                return false;
            }
            $message = '[Check] entered_by column detected.';
            return true;
        }

        if ($version === '20260213_0003_user_roles_phase1.sql')
        {
            $roleTable = $db->getAllAssoc("SHOW TABLES LIKE 'user_role'");
            if (empty($roleTable))
            {
                $message = 'user_role table not found; migration verification failed.';
                return false;
            }

            $roleColumn = $db->getAllAssoc("SHOW COLUMNS FROM user LIKE 'role_id'");
            if (empty($roleColumn))
            {
                $message = 'user.role_id column not found; migration verification failed.';
                return false;
            }

            $requiredRoleCount = $db->getAssoc(sprintf(
                "SELECT COUNT(*) AS roleCount
                 FROM user_role
                 WHERE site_id = %s
                 AND role_key IN ('site_admin', 'hr_manager', 'hr_recruiter', 'top_management')",
                $db->makeQueryInteger($this->_siteID)
            ));

            if (empty($requiredRoleCount) || (int) $requiredRoleCount['roleCount'] < 4)
            {
                $message = 'Default roles are missing for this site; migration verification failed.';
                return false;
            }

            $missingRoleIDCount = $db->getAssoc(sprintf(
                "SELECT COUNT(*) AS missingCount
                 FROM user
                 WHERE site_id = %s
                 AND role_id IS NULL",
                $db->makeQueryInteger($this->_siteID)
            ));

            if (!empty($missingRoleIDCount) && (int) $missingRoleIDCount['missingCount'] > 0)
            {
                $message = 'Some users have no role_id after migration; migration verification failed.';
                return false;
            }

            $message = '[Check] user_role schema verified with seeded defaults.';
            return true;
        }

        if ($version === '20260214_0005_saved_list_user_access_phase1.sql')
        {
            $tableRS = $db->getAllAssoc("SHOW TABLES LIKE 'saved_list_user_access'");
            if (empty($tableRS))
            {
                $message = 'saved_list_user_access table not found; migration verification failed.';
                return false;
            }

            $requiredColumns = array(
                'saved_list_user_access_id',
                'site_id',
                'saved_list_id',
                'user_id',
                'can_edit'
            );

            foreach ($requiredColumns as $columnName)
            {
                $columnRS = $db->getAllAssoc(
                    "SHOW COLUMNS FROM saved_list_user_access LIKE " . $db->makeQueryString($columnName)
                );
                if (empty($columnRS))
                {
                    $message = 'saved_list_user_access.' . $columnName . ' column not found; migration verification failed.';
                    return false;
                }
            }

            $message = '[Check] saved_list_user_access schema verified.';
            return true;
        }

        return true;
    }

    private function buildMigrationFailureDetails(
        $stage,
        $migration,
        $db,
        $dbError = '',
        $failedSQL = '',
        $dbState = array()
    )
    {
        if ($dbError === '')
        {
            $dbError = $db->getError();
        }
        $details = array(
            'stage=' . $stage,
            'version=' . (isset($migration['version']) ? $migration['version'] : ''),
            'checksum=' . (isset($migration['checksum']) ? $migration['checksum'] : ''),
            'siteID=' . (int) $this->_siteID,
            'userID=' . (int) $this->_userID,
            'CATS_SLAVE=' . ((defined('CATS_SLAVE') && CATS_SLAVE) ? 'true' : 'false'),
            'dbError=' . $dbError
        );

        if (strpos($dbError, 'errno: 0') !== false)
        {
            $details[] = 'hint=MySQL returned no SQL error; query may be blocked before execution (read-only/slave mode or DB query filter), or DB handle is stale.';
        }

        if ($failedSQL !== '')
        {
            $details[] = 'failedSQL=' . substr(preg_replace('/\s+/', ' ', $failedSQL), 0, 300);
        }

        if (is_array($dbState) && !empty($dbState))
        {
            $details[] = 'dbState=' . json_encode($dbState);
        }

        return 'Failed to record migration. ' . implode(' | ', $details);
    }

    private function getMigrationDBState($db)
    {
        $state = array();

        $conn = $db->getConnection();
        if (!is_object($conn))
        {
            $state['connection'] = 'missing';
            return $state;
        }

        $state['connection'] = 'ok';
        $state['ping'] = @mysqli_ping($conn) ? 1 : 0;
        $state['errno'] = (int) @mysqli_errno($conn);
        $state['error'] = (string) @mysqli_error($conn);
        $state['sqlState'] = (string) @mysqli_sqlstate($conn);
        $state['threadID'] = (int) @mysqli_thread_id($conn);
        $state['serverInfo'] = (string) @mysqli_get_server_info($conn);

        return $state;
    }

    private function logMigrationEvent($event, $context = array())
    {
        $payload = array(
            'event' => $event,
            'siteID' => (int) $this->_siteID,
            'userID' => (int) $this->_userID
        );

        if (is_array($context) && !empty($context))
        {
            foreach ($context as $key => $value)
            {
                $payload[$key] = $value;
            }
        }

        error_log('SchemaMigrations | ' . json_encode($payload));
    }

    /*
     * Called by handleRequest() to process the administration page.
     */
    private function onAdministration()
    {
        $administrationMode = $this->getTrimmedInput(
            'administrationMode',
            $_POST
        );

        switch ($administrationMode)
        {
            case 'changeSiteName':
                if ($this->getUserAccessLevel('settings.administration.changeSiteName') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for administration.');
                }
                $siteName = $this->getTrimmedInput(
                    'siteName',
                    $_POST
                );

                if (empty($siteName))
                {
                    CommonErrors::fatal(COMMONERROR_MISSINGFIELDS, $this, 'Required fields are missing.');
                }

                $this->changeSiteName($siteName);
                CATSUtility::transferRelativeURI('m=settings&a=administration');
                break;

            case 'changeVersionCheck':
                if ($this->getUserAccessLevel('settings.administration.changeVersionName') < ACCESS_LEVEL_ROOT)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for administration.');
                }

                $this->changeNewVersionCheck(
                    $this->isChecked('versionCheck', $_POST)
                );

                $versionCheckPref = $this->isChecked('versionCheck', $_POST);
                CATSUtility::transferRelativeURI('m=settings&a=administration');
                break;

            case 'localization':
                if ($this->getUserAccessLevel('settings.administration.localization') < ACCESS_LEVEL_SA)
                {
                    CommonErrors::fatal(COMMONERROR_PERMISSION, $this, 'Invalid user level for administration.');
                }
                //FIXME: Validation (escaped at lib level anyway)
                $timeZone = $_POST['timeZone'];
                $dateFormat = $_POST['dateFormat'];
                if ($dateFormat == 'mdy')
                {
                    $isDMY = false;
                }
                else
                {
                    $isDMY = true;
                }

                $site = new Site($this->_siteID);
                $site->setLocalization($timeZone, $isDMY);

                $_SESSION['CATS']->logout();
                unset($_SESSION['CATS']);

                CATSUtility::transferRelativeURI('?m=settings&a=administration&messageSuccess=true&message='.urlencode('Localization settings saved!  Please log back in for the settings to take effect.'));
                break;

            default:
                CATSUtility::transferRelativeURI('m=settings&a=administration');
                break;
        }
    }

    private function renderModernAdministrationJSON(
        $modernPage,
        $systemInfoData,
        $newVersion,
        $versionCheckPref,
        $systemAdministration,
        $careerPortalUnlock,
        $rolePermissionsEnabled,
        $totalCandidates,
        $message,
        $messageSuccess
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $sections = array();

        $siteManagementItems = array(
            $this->buildModernAdministrationItem(
                'Careers Website',
                'Configure your website where applicants can apply and post their resumes for your jobs.',
                $careerPortalUnlock
                    ? sprintf('%s?m=settings&a=careerPortalSettings&ui=legacy', $baseURL)
                    : 'http://www.catsone.com/?a=careerswebsite',
                '',
                false,
                !$careerPortalUnlock
            ),
            $this->buildModernAdministrationItem(
                'Change Site Details',
                'Change the site details such as site name and institution configuration.',
                sprintf('%s?m=settings&a=administration&s=siteName&ui=legacy', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'General E-Mail Configuration',
                'Configure E-Mail preferences such as return address and when E-Mails are sent.',
                sprintf('%s?m=settings&a=emailSettings&ui=legacy', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'E-Mail Template Configuration',
                'Configure E-Mail templates for your site.',
                sprintf('%s?m=settings&a=emailTemplates&ui=legacy', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'Localization',
                'Change how addresses and times are displayed and behave for different regions.',
                sprintf('%s?m=settings&a=administration&s=localization&ui=legacy', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'Data Import',
                'Import resumes, candidates, companies or contacts from files on your computer.',
                sprintf('%s?m=import&ui=legacy', $baseURL),
                $totalCandidates <= 0 ? 'Seed data' : '',
                $totalCandidates <= 0
            ),
            $this->buildModernAdministrationItem(
                'Site Backup',
                'Produce a downloadable backup with all the content in your site.',
                sprintf('%s?m=settings&a=createBackup&ui=legacy', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'Schema Migrations',
                'Review and apply pending schema migrations.',
                sprintf('%s?m=settings&a=schemaMigrations&ui=modern', $baseURL),
                $newVersion ? 'Update available' : '',
                $newVersion
            )
        );
        $sections[] = $this->buildModernAdministrationSection(
            'site-management',
            'Site Management',
            'Core configuration and lifecycle settings used by site administrators.',
            $siteManagementItems
        );

        $featureSettingsItems = array(
            $this->buildModernAdministrationItem(
                'EEO / EOC Support',
                'Enable and configure EEO / EOC compliance tracking.',
                sprintf('%s?m=settings&a=eeo&ui=legacy', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'GDPR Settings',
                'Configure GDPR consent defaults such as expiration timeline.',
                sprintf('%s?m=settings&a=gdprSettings&ui=modern', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'Feedback Settings',
                'Configure which user receives feedback submitted from the global footer.',
                sprintf('%s?m=settings&a=feedbackSettings&ui=legacy', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'Configure Tags',
                'Add/Remove tags, description for tags',
                sprintf('%s?m=settings&a=tags&ui=modern', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'Rejection Reasons',
                'Add or rename rejection reasons for pipeline status changes.',
                sprintf('%s?m=settings&a=rejectionReasons&ui=modern', $baseURL)
            ),
            $this->buildModernAdministrationItem(
                'TalentFitFlow Integration',
                'Configure API credentials for CV transformations.',
                sprintf('%s?m=settings&a=talentFitFlowSettings&ui=legacy', $baseURL)
            )
        );
        $sections[] = $this->buildModernAdministrationSection(
            'feature-settings',
            'Feature Settings',
            'Compliance, tagging, and workflow integrations that shape recruiter behavior.',
            $featureSettingsItems
        );

        $userManagementItems = array(
            $this->buildModernAdministrationItem(
                'User Management',
                'Add, edit and delete users for your site.',
                sprintf('%s?m=settings&a=manageUsers&ui=modern', $baseURL)
            )
        );
        if ((int) $rolePermissionsEnabled === 1)
        {
            $userManagementItems[] = $this->buildModernAdministrationItem(
                'Role Access Matrix',
                'Configure page visibility and minimum access level by role.',
                sprintf('%s?m=settings&a=rolePagePermissions&ui=modern', $baseURL)
            );
        }
        $userManagementItems[] = $this->buildModernAdministrationItem(
            'Login Activity',
            'Shows you the login history for your site.',
            sprintf('%s?m=settings&a=loginActivity&ui=modern', $baseURL)
        );
        $userManagementItems[] = $this->buildModernAdministrationItem(
            'Google SSO / Access Request',
            'Configure Google Workspace sign-in and access request provisioning e-mails.',
            sprintf('%s?m=settings&a=googleOIDCSettings&ui=legacy', $baseURL)
        );
        $sections[] = $this->buildModernAdministrationSection(
            'user-management',
            'User Management',
            'Identity, permissions, and access-request controls for the tenant.',
            $userManagementItems
        );

        $flash = array();
        if ($message !== '')
        {
            $flash = array(
                'message' => $message,
                'success' => (strtolower($messageSuccess) === 'true' || $messageSuccess === '1')
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.administration.v1',
                'modernPage' => $modernPage
            ),
            'summary' => array(
                'siteName' => (string) $_SESSION['CATS']->getSiteName(),
                'version' => CATSUtility::getVersion(),
                'fullName' => (string) $_SESSION['CATS']->getFullName(),
                'systemAdministration' => ((bool) $systemAdministration),
                'careerPortalUnlock' => ((bool) $careerPortalUnlock),
                'rolePermissionsEnabled' => ((bool) $rolePermissionsEnabled),
                'totalCandidates' => (int) $totalCandidates,
                'newVersionAvailable' => ((bool) $newVersion),
                'versionCheckPref' => ((bool) $versionCheckPref)
            ),
            'sections' => $sections,
            'actions' => array(
                'dashboardURL' => sprintf('%s?m=dashboard&a=my&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=administration&ui=legacy', $baseURL)
            )
        );
        if (!empty($flash))
        {
            $payload['flash'] = $flash;
        }

        $this->respondModernJSON(200, $payload);
    }

    /*
     * Called by handleRequest to change localization settings at administrator login for ASP systems.
     */
    private function onAspLocalization()
    {
        // FIXME: Input validation!

        $timeZone = $_POST['timeZone'];
        $dateFormat = $_POST['dateFormat'];
        if ($dateFormat == 'mdy')
        {
            $isDMY = false;
        }
        else
        {
            $isDMY = true;
        }

        $site = new Site($this->_siteID);
        $site->setLocalization($timeZone, $dateFormat);

        /* Reload the new data for the session. */
        $_SESSION['CATS']->setTimeDateLocalization($timeZone, $isDMY);

        $this->_template->assign('inputType', 'conclusion');
        $this->_template->assign('title', 'Localization Settings Saved!');
        $this->_template->assign('prompt', 'Your localization settings have been saved. This concludes the CATS initial configuration wizard.');
        $this->_template->assign('action', $this->getAction());
        $this->_template->assign('home', 'home');
        $this->_template->display('./modules/settings/NewInstallWizard.tpl');
    }

    /*
     * Called by Administration to change site name.
     */
    private function changeSiteName($newSiteName)
    {
        $site = new Site($this->_siteID);
        $site->setName($newSiteName);

        $_SESSION['CATS']->setSiteName($newSiteName);
        NewVersionCheck::checkForUpdate();
    }

    /*
     *  Called by Administration to change new version preferences.
     */
    private function changeNewVersionCheck($enableNewVersionCheck)
    {
        $systemInfo = new SystemInfo();
        $systemInfo->updateVersionCheckPrefs($enableNewVersionCheck);

        NewVersionCheck::checkForUpdate();
    }

    private function renderModernMyProfileJSON($modernPage)
    {
        $baseURL = CATSUtility::getIndexName();

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.myprofile.v1',
                'modernPage' => $modernPage
            ),
            'summary' => array(
                'userID' => (int) $this->_userID,
                'fullName' => (string) $_SESSION['CATS']->getFullName(),
                'isDemoUser' => ((bool) $_SESSION['CATS']->isDemo()),
                'authMode' => (string) AUTH_MODE
            ),
            'actions' => array(
                'showProfileURL' => sprintf(
                    '%s?m=settings&a=showUser&userID=%d&privledged=false&ui=legacy',
                    $baseURL,
                    (int) $this->_userID
                ),
                'changePasswordURL' => sprintf(
                    '%s?m=settings&a=myProfile&s=changePassword&ui=modern',
                    $baseURL
                ),
                'legacyURL' => sprintf('%s?m=settings&a=myProfile&ui=legacy', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernMyProfileChangePasswordJSON($modernPage)
    {
        $baseURL = CATSUtility::getIndexName();

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.myprofile.changePassword.v1',
                'modernPage' => $modernPage
            ),
            'summary' => array(
                'userID' => (int) $this->_userID,
                'fullName' => (string) $_SESSION['CATS']->getFullName(),
                'isDemoUser' => ((bool) $_SESSION['CATS']->isDemo()),
                'authMode' => (string) AUTH_MODE
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=changePassword', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=myProfile&s=changePassword&ui=legacy', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=myProfile&ui=modern', $baseURL)
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernLoginActivityJSON(
        $modernPage,
        $view,
        $currentPage,
        $totalPages,
        $totalRows,
        $sortBy,
        $sortDirection,
        $validSortByFields,
        $rows
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedView = (strtolower((string) $view) === 'unsuccessful') ? 'unsuccessful' : 'successful';
        $normalizedRows = array();

        foreach ($rows as $row)
        {
            $normalizedRows[] = array(
                'userLoginID' => (int) $row['userLoginID'],
                'userID' => (int) $row['userID'],
                'firstName' => (string) $row['firstName'],
                'lastName' => (string) $row['lastName'],
                'ip' => (string) $row['ip'],
                'hostname' => (string) $row['hostname'],
                'shortUserAgent' => (string) $row['shortUserAgent'],
                'date' => (string) $row['date'],
                'dateSort' => (string) $row['dateSort'],
                'userURL' => sprintf(
                    '%s?m=settings&a=showUser&userID=%d&ui=legacy',
                    $baseURL,
                    (int) $row['userID']
                )
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.loginActivity.v1',
                'modernPage' => $modernPage,
                'view' => $normalizedView,
                'page' => (int) $currentPage,
                'totalPages' => (int) $totalPages,
                'totalRows' => (int) $totalRows,
                'entriesPerPage' => (int) LOGIN_ENTRIES_PER_PAGE,
                'sortBy' => (string) $sortBy,
                'sortDirection' => strtoupper((string) $sortDirection),
                'validSortByFields' => $validSortByFields
            ),
            'actions' => array(
                'routeURL' => sprintf('%s?m=settings&a=loginActivity&ui=modern', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=loginActivity&ui=legacy', $baseURL)
            ),
            'rows' => $normalizedRows
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernRejectionReasonsJSON($modernPage, $rejectionReasons, $saved)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalized = array();
        foreach ($rejectionReasons as $reason)
        {
            $normalized[] = array(
                'rejectionReasonID' => (int) $reason['rejectionReasonID'],
                'label' => (string) $reason['label']
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.rejectionReasons.v1',
                'modernPage' => $modernPage
            ),
            'flash' => array(
                'saved' => ($saved ? true : false),
                'message' => ($saved ? 'Rejection reasons saved successfully.' : '')
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=rejectionReasons', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=rejectionReasons&ui=legacy', $baseURL)
            ),
            'rejectionReasons' => $normalized
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernTagsJSON($modernPage, $tagsRS)
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedTags = array();
        foreach ($tagsRS as $tag)
        {
            $parentTagID = 0;
            if (isset($tag['tag_parent_id']) && $tag['tag_parent_id'] !== '' && $tag['tag_parent_id'] !== null)
            {
                $parentTagID = (int) $tag['tag_parent_id'];
            }

            $normalizedTags[] = array(
                'tagID' => (int) $tag['tag_id'],
                'parentTagID' => $parentTagID,
                'parentTagTitle' => isset($tag['tag_parent_title']) ? (string) $tag['tag_parent_title'] : '',
                'tagTitle' => (string) $tag['tag_title']
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.tags.v1',
                'modernPage' => $modernPage
            ),
            'actions' => array(
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=tags&ui=legacy', $baseURL),
                'addURL' => sprintf('%s?m=settings&a=ajax_tags_add', $baseURL),
                'updateURL' => sprintf('%s?m=settings&a=ajax_tags_upd', $baseURL),
                'deleteURL' => sprintf('%s?m=settings&a=ajax_tags_del', $baseURL)
            ),
            'tags' => $normalizedTags
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernRolePagePermissionsJSON(
        $modernPage,
        $rolePermissionsEnabled,
        $matrixData,
        $accessOptions,
        $message
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $roles = isset($matrixData['roles']) ? $matrixData['roles'] : array();
        $pages = isset($matrixData['pages']) ? $matrixData['pages'] : array();
        $matrix = isset($matrixData['matrix']) ? $matrixData['matrix'] : array();

        $normalizedRoles = array();
        foreach ($roles as $role)
        {
            $normalizedRoles[] = array(
                'roleID' => (int) $role['roleID'],
                'roleKey' => isset($role['roleKey']) ? (string) $role['roleKey'] : '',
                'roleName' => isset($role['roleName']) ? (string) $role['roleName'] : '',
                'accessLevel' => isset($role['accessLevel']) ? (int) $role['accessLevel'] : 0
            );
        }

        $normalizedPages = array();
        foreach ($pages as $pageKey => $pageData)
        {
            $normalizedPages[] = array(
                'pageKey' => (string) $pageKey,
                'label' => isset($pageData['label']) ? (string) $pageData['label'] : (string) $pageKey,
                'module' => isset($pageData['module']) ? (string) $pageData['module'] : '',
                'action' => isset($pageData['action']) ? (string) $pageData['action'] : ''
            );
        }

        $normalizedOptions = array();
        foreach ($accessOptions as $optionKey => $optionData)
        {
            $normalizedOptions[] = array(
                'optionKey' => (string) $optionKey,
                'label' => isset($optionData['label']) ? (string) $optionData['label'] : (string) $optionKey,
                'isVisible' => isset($optionData['isVisible']) ? (int) $optionData['isVisible'] : 0,
                'requiredAccessLevel' => isset($optionData['requiredAccessLevel']) ? (int) $optionData['requiredAccessLevel'] : 0
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.rolePagePermissions.v1',
                'modernPage' => $modernPage
            ),
            'message' => (string) $message,
            'rolePermissionsEnabled' => ((int) $rolePermissionsEnabled === 1),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=rolePagePermissions', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=rolePagePermissions&ui=legacy', $baseURL),
                'schemaMigrationsURL' => sprintf('%s?m=settings&a=schemaMigrations&ui=modern', $baseURL)
            ),
            'roles' => $normalizedRoles,
            'pages' => $normalizedPages,
            'accessOptions' => $normalizedOptions,
            'matrix' => $matrix
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernSchemaMigrationsJSON(
        $modernPage,
        $migrations,
        $pendingCount,
        $dirMissing,
        $message,
        $errorMessage
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $normalizedMigrations = array();
        foreach ($migrations as $migration)
        {
            $normalizedMigrations[] = array(
                'version' => (string) $migration['version'],
                'checksum' => (string) $migration['checksum'],
                'applied' => (!empty($migration['applied'])),
                'appliedAt' => isset($migration['appliedAt']) ? (string) $migration['appliedAt'] : '',
                'appliedBy' => isset($migration['appliedBy']) ? (string) $migration['appliedBy'] : '',
                'checksumMatches' => (!empty($migration['checksumMatches']))
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.schemaMigrations.v1',
                'modernPage' => $modernPage
            ),
            'message' => (string) $message,
            'errorMessage' => (string) $errorMessage,
            'dirMissing' => ((int) $dirMissing === 1),
            'pendingCount' => (int) $pendingCount,
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=schemaMigrations', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=schemaMigrations&ui=legacy', $baseURL)
            ),
            'migrations' => $normalizedMigrations
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernViewItemHistoryJSON(
        $modernPage,
        $dataItemType,
        $dataItemID,
        $data,
        $revisionRS
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $title = 'Item History';
        $subtitle = '';

        switch ((int) $dataItemType)
        {
            case DATA_ITEM_CANDIDATE:
                $title = 'Candidate History';
                $subtitle = trim((string) ($data['firstName'] . ' ' . $data['lastName']));
                break;

            case DATA_ITEM_JOBORDER:
                $title = 'Job Order History';
                $subtitle = isset($data['title']) ? (string) $data['title'] : '';
                break;

            case DATA_ITEM_COMPANY:
                $title = 'Company History';
                $subtitle = isset($data['name']) ? (string) $data['name'] : '';
                break;

            case DATA_ITEM_CONTACT:
                $title = 'Contact History';
                $subtitle = trim((string) ($data['firstName'] . ' ' . $data['lastName']));
                break;
        }

        $longFields = array('description', 'notes');
        $fields = array();
        foreach ($data as $field => $value)
        {
            $fields[] = array(
                'key' => (string) $field,
                'label' => (string) $field,
                'value' => $this->normalizeModernHistoryValue($value),
                'isLongField' => in_array($field, $longFields)
            );
        }

        $revisions = array();
        foreach ($revisionRS as $revisionID => $revision)
        {
            $description = '';
            if (isset($revision['description']) && $revision['description'] !== '')
            {
                $description = str_replace(
                    '(USER)',
                    isset($revision['enteredByFullName']) ? $revision['enteredByFullName'] : '',
                    $revision['description']
                );
            }

            $theField = isset($revision['theField']) ? (string) $revision['theField'] : '';
            $revisions[] = array(
                'revisionID' => (int) $revisionID,
                'theField' => $theField,
                'dateModified' => isset($revision['dateModified']) ? (string) $revision['dateModified'] : '',
                'enteredByFullName' => isset($revision['enteredByFullName']) ? (string) $revision['enteredByFullName'] : '',
                'description' => (string) $description,
                'previousValue' => $this->normalizeModernHistoryValue(isset($revision['previousValue']) ? $revision['previousValue'] : ''),
                'newValue' => $this->normalizeModernHistoryValue(isset($revision['newValue']) ? $revision['newValue'] : ''),
                'isFieldRevision' => ($theField !== '' && $theField !== strtoupper($theField))
            );
        }

        $backURL = sprintf('%s?m=settings&a=administration&ui=modern', $baseURL);
        switch ((int) $dataItemType)
        {
            case DATA_ITEM_CANDIDATE:
                $backURL = sprintf('%s?m=candidates&a=show&candidateID=%d&ui=modern', $baseURL, (int) $dataItemID);
                break;

            case DATA_ITEM_JOBORDER:
                $backURL = sprintf('%s?m=joborders&a=show&jobOrderID=%d&ui=modern', $baseURL, (int) $dataItemID);
                break;

            case DATA_ITEM_COMPANY:
                $backURL = sprintf('%s?m=companies&a=show&companyID=%d&ui=modern', $baseURL, (int) $dataItemID);
                break;

            case DATA_ITEM_CONTACT:
                $backURL = sprintf('%s?m=contacts&a=show&contactID=%d&ui=modern', $baseURL, (int) $dataItemID);
                break;
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.viewItemHistory.v1',
                'modernPage' => $modernPage,
                'dataItemType' => (int) $dataItemType,
                'dataItemID' => (int) $dataItemID
            ),
            'summary' => array(
                'title' => $title,
                'subtitle' => $subtitle
            ),
            'actions' => array(
                'backURL' => $backURL,
                'legacyURL' => sprintf(
                    '%s?m=settings&a=viewItemHistory&dataItemType=%d&dataItemID=%d&ui=legacy',
                    $baseURL,
                    (int) $dataItemType,
                    (int) $dataItemID
                )
            ),
            'fields' => $fields,
            'revisions' => $revisions
        );

        $this->respondModernJSON(200, $payload);
    }

    private function normalizeModernHistoryValue($value)
    {
        if (is_null($value))
        {
            return '';
        }

        if (is_bool($value))
        {
            return ($value ? '1' : '0');
        }

        if (is_scalar($value))
        {
            return (string) $value;
        }

        return json_encode($value);
    }

    private function renderModernManageUsersJSON($modernPage, $rows, $license, $userRolesEnabled)
    {
        $baseURL = CATSUtility::getIndexName();
        $canDeleteUsers = ($this->getUserAccessLevel('settings.deleteUser') >= ACCESS_LEVEL_SA);
        $canAddUsers = (AUTH_MODE != 'ldap');
        $normalizedRows = array();

        foreach ($rows as $row)
        {
            $userID = (int) $row['userID'];
            $normalizedRows[] = array(
                'userID' => $userID,
                'firstName' => (string) $row['firstName'],
                'lastName' => (string) $row['lastName'],
                'username' => (string) $row['username'],
                'applicationRole' => isset($row['applicationRole']) ? (string) $row['applicationRole'] : '',
                'accessLevel' => (int) $row['accessLevel'],
                'accessLevelDescription' => (string) $row['accessLevelDescription'],
                'successfulDate' => (string) $row['successfulDate'],
                'unsuccessfulDate' => (string) $row['unsuccessfulDate'],
                'showURL' => sprintf('%s?m=settings&a=showUser&userID=%d&ui=modern', $baseURL, $userID),
                'editURL' => sprintf('%s?m=settings&a=editUser&userID=%d&ui=modern', $baseURL, $userID),
                'canDelete' => ($canDeleteUsers && $userID !== (int) $this->_userID)
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.manageUsers.v1',
                'modernPage' => $modernPage
            ),
            'summary' => array(
                'totalUsers' => (int) count($normalizedRows),
                'totalLicensedUsers' => isset($license['userLicenses']) ? (int) $license['userLicenses'] : 0,
                'availableSlots' => isset($license['diff']) ? (int) $license['diff'] : 0,
                'unlimitedLicenses' => !empty($license['unlimited']),
                'canAddLicensedUsers' => !empty($license['canAdd'])
            ),
            'state' => array(
                'authMode' => (string) AUTH_MODE,
                'currentUserID' => (int) $this->_userID,
                'userRolesEnabled' => ((int) $userRolesEnabled === 1)
            ),
            'actions' => array(
                'addUserURL' => sprintf('%s?m=settings&a=addUser&ui=modern', $baseURL),
                'deleteActionURL' => sprintf('%s?m=settings&a=ajax_wizardDeleteUser', $baseURL),
                'backURL' => sprintf('%s?m=settings&a=administration&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=manageUsers&ui=legacy', $baseURL)
            ),
            'permissions' => array(
                'canDeleteUsers' => $canDeleteUsers,
                'canAddUsers' => $canAddUsers
            ),
            'rows' => $normalizedRows
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernAddUserJSON(
        $modernPage,
        $accessLevels,
        $license,
        $categories,
        $EEOSettingsRS,
        $userRolesEnabled,
        $userRolesRS,
        $defaultUserRoleID
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $maxAssignableAccessLevel = (int) $this->getUserAccessLevel('settings.addUser');
        $normalizedAccessLevels = array();
        foreach ($accessLevels as $accessLevel)
        {
            $accessID = (int) $accessLevel['accessID'];
            if ($accessID > $maxAssignableAccessLevel)
            {
                continue;
            }
            if (empty($license['canAdd']) && empty($license['unlimited']) && $accessID > ACCESS_LEVEL_READ)
            {
                continue;
            }

            $normalizedAccessLevels[] = array(
                'accessID' => $accessID,
                'shortDescription' => (string) $accessLevel['shortDescription'],
                'longDescription' => (string) $accessLevel['longDescription'],
                'isDefault' => ($accessID === (int) ACCESS_LEVEL_DELETE)
            );
        }

        $normalizedCategories = array();
        foreach ($categories as $category)
        {
            $normalizedCategories[] = array(
                'label' => isset($category[0]) ? (string) $category[0] : '',
                'value' => isset($category[1]) ? (string) $category[1] : '',
                'description' => isset($category[2]) ? (string) $category[2] : '',
                'requiredAccessLevel' => isset($category[3]) ? (int) $category[3] : 0,
                'forcedAccessLevel' => isset($category[4]) ? (int) $category[4] : 0
            );
        }

        $normalizedRoles = array();
        foreach ($userRolesRS as $userRole)
        {
            $normalizedRoles[] = array(
                'roleID' => (int) $userRole['roleID'],
                'roleKey' => (string) $userRole['roleKey'],
                'roleName' => (string) $userRole['roleName'],
                'accessLevel' => (int) $userRole['accessLevel'],
                'isActive' => (int) $userRole['isActive']
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.addUser.v1',
                'modernPage' => $modernPage
            ),
            'state' => array(
                'authMode' => (string) AUTH_MODE,
                'defaultAccessLevel' => (int) ACCESS_LEVEL_DELETE,
                'userRolesEnabled' => ((int) $userRolesEnabled === 1),
                'defaultUserRoleID' => (int) $defaultUserRoleID,
                'eeoEnabled' => (!empty($EEOSettingsRS['enabled'])),
                'showLicenseWarning' => (empty($license['canAdd']) && empty($license['unlimited']))
            ),
            'summary' => array(
                'totalLicensedUsers' => isset($license['userLicenses']) ? (int) $license['userLicenses'] : 0,
                'availableSlots' => isset($license['diff']) ? (int) $license['diff'] : 0
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=addUser', $baseURL),
                'manageUsersURL' => sprintf('%s?m=settings&a=manageUsers&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=addUser&ui=legacy', $baseURL)
            ),
            'accessLevels' => $normalizedAccessLevels,
            'categories' => $normalizedCategories,
            'roles' => $normalizedRoles
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernEditUserJSON(
        $modernPage,
        $data,
        $accessLevels,
        $license,
        $categories,
        $EEOSettingsRS,
        $userRolesEnabled,
        $userRolesRS,
        $selectedUserRoleID,
        $cannotEnableMessage,
        $disableAccessChange
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $maxAssignableAccessLevel = (int) $this->getUserAccessLevel('');
        $userID = (int) $data['userID'];

        $normalizedAccessLevels = array();
        foreach ($accessLevels as $accessLevel)
        {
            $accessID = (int) $accessLevel['accessID'];
            if ($accessID > $maxAssignableAccessLevel)
            {
                continue;
            }

            $normalizedAccessLevels[] = array(
                'accessID' => $accessID,
                'shortDescription' => (string) $accessLevel['shortDescription'],
                'longDescription' => (string) $accessLevel['longDescription'],
                'isSelected' => ((int) $data['accessLevel'] === $accessID),
                'isDisabled' => (
                    ($disableAccessChange && $accessID > ACCESS_LEVEL_READ) ||
                    ((int) $this->_userID === $userID)
                )
            );
        }

        $normalizedCategories = array();
        foreach ($categories as $category)
        {
            $value = isset($category[1]) ? (string) $category[1] : '';
            $normalizedCategories[] = array(
                'label' => isset($category[0]) ? (string) $category[0] : '',
                'value' => $value,
                'description' => isset($category[2]) ? (string) $category[2] : '',
                'isSelected' => ((string) $data['categories'] === $value)
            );
        }

        $normalizedRoles = array();
        foreach ($userRolesRS as $userRole)
        {
            $normalizedRoles[] = array(
                'roleID' => (int) $userRole['roleID'],
                'roleKey' => (string) $userRole['roleKey'],
                'roleName' => (string) $userRole['roleName'],
                'accessLevel' => (int) $userRole['accessLevel'],
                'isActive' => (int) $userRole['isActive']
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.editUser.v1',
                'modernPage' => $modernPage,
                'userID' => $userID
            ),
            'state' => array(
                'authMode' => (string) AUTH_MODE,
                'currentUserID' => (int) $this->_userID,
                'userRolesEnabled' => ((int) $userRolesEnabled === 1),
                'selectedUserRoleID' => (int) $selectedUserRoleID,
                'cannotEnableMessage' => ($cannotEnableMessage ? true : false),
                'disableAccessChange' => ($disableAccessChange ? true : false),
                'canResetPassword' => (AUTH_MODE != 'ldap'),
                'eeoEnabled' => (!empty($EEOSettingsRS['enabled']))
            ),
            'summary' => array(
                'totalLicensedUsers' => isset($license['userLicenses']) ? (int) $license['userLicenses'] : 0,
                'availableSlots' => isset($license['diff']) ? (int) $license['diff'] : 0
            ),
            'actions' => array(
                'submitURL' => sprintf('%s?m=settings&a=editUser', $baseURL),
                'showUserURL' => sprintf('%s?m=settings&a=showUser&userID=%d&ui=modern', $baseURL, $userID),
                'manageUsersURL' => sprintf('%s?m=settings&a=manageUsers&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=editUser&userID=%d&ui=legacy', $baseURL, $userID)
            ),
            'user' => array(
                'userID' => $userID,
                'firstName' => (string) $data['firstName'],
                'lastName' => (string) $data['lastName'],
                'email' => (string) $data['email'],
                'username' => (string) $data['username'],
                'accessLevel' => (int) $data['accessLevel'],
                'accessLevelDescription' => (string) $data['accessLevelDescription'],
                'accessLevelLongDescription' => (string) $data['accessLevelLongDescription'],
                'categories' => (string) $data['categories'],
                'canSeeEEOInfo' => !empty($data['canSeeEEOInfo'])
            ),
            'accessLevels' => $normalizedAccessLevels,
            'categories' => $normalizedCategories,
            'roles' => $normalizedRoles
        );

        $this->respondModernJSON(200, $payload);
    }

    private function renderModernShowUserJSON(
        $modernPage,
        $privledged,
        $data,
        $categories,
        $EEOSettingsRS,
        $userRolesEnabled,
        $applicationRole,
        $loginAttempts
    )
    {
        $baseURL = CATSUtility::getIndexName();
        $userID = (int) $data['userID'];
        $categoryLabel = '';
        $categoryDescription = '';

        foreach ($categories as $category)
        {
            if ((string) $data['categories'] === (string) $category[1])
            {
                $categoryLabel = isset($category[0]) ? (string) $category[0] : '';
                $categoryDescription = isset($category[2]) ? (string) $category[2] : '';
                break;
            }
        }

        $normalizedAttempts = array();
        foreach ($loginAttempts as $attempt)
        {
            $normalizedAttempts[] = array(
                'ip' => (string) $attempt['ip'],
                'hostname' => (string) $attempt['hostname'],
                'shortUserAgent' => (string) $attempt['shortUserAgent'],
                'date' => (string) $attempt['date'],
                'successful' => (string) $attempt['successful']
            );
        }

        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => 'settings.showUser.v1',
                'modernPage' => $modernPage,
                'userID' => $userID
            ),
            'state' => array(
                'privledged' => ($privledged ? true : false),
                'userRolesEnabled' => ((int) $userRolesEnabled === 1),
                'eeoEnabled' => (!empty($EEOSettingsRS['enabled']))
            ),
            'actions' => array(
                'editURL' => sprintf('%s?m=settings&a=editUser&userID=%d&ui=modern', $baseURL, $userID),
                'manageUsersURL' => sprintf('%s?m=settings&a=manageUsers&ui=modern', $baseURL),
                'settingsURL' => sprintf('%s?m=settings&ui=modern', $baseURL),
                'legacyURL' => sprintf('%s?m=settings&a=showUser&userID=%d&ui=legacy', $baseURL, $userID)
            ),
            'user' => array(
                'userID' => $userID,
                'firstName' => (string) $data['firstName'],
                'lastName' => (string) $data['lastName'],
                'fullName' => trim((string) ($data['firstName'] . ' ' . $data['lastName'])),
                'email' => (string) $data['email'],
                'username' => (string) $data['username'],
                'accessLevel' => (int) $data['accessLevel'],
                'accessLevelLongDescription' => (string) $data['accessLevelLongDescription'],
                'canSeeEEOInfo' => !empty($data['canSeeEEOInfo']),
                'successfulDate' => (string) $data['successfulDate'],
                'unsuccessfulDate' => (string) $data['unsuccessfulDate'],
                'category' => array(
                    'value' => (string) $data['categories'],
                    'label' => $categoryLabel,
                    'description' => $categoryDescription
                ),
                'applicationRole' => array(
                    'roleName' => isset($applicationRole['roleName']) ? (string) $applicationRole['roleName'] : '',
                    'roleKey' => isset($applicationRole['roleKey']) ? (string) $applicationRole['roleKey'] : '',
                    'accessLevel' => isset($applicationRole['accessLevel']) ? (int) $applicationRole['accessLevel'] : 0
                )
            ),
            'loginAttempts' => $normalizedAttempts
        );

        $this->respondModernJSON(200, $payload);
    }

    private function buildModernAdministrationSection($key, $title, $description, $items)
    {
        return array(
            'key' => (string) $key,
            'title' => (string) $title,
            'description' => (string) $description,
            'items' => $items
        );
    }

    private function buildModernAdministrationItem($label, $description, $href, $badge = '', $highlight = false, $external = false)
    {
        $item = array(
            'label' => (string) $label,
            'description' => (string) $description,
            'href' => (string) $href
        );
        if ($badge !== '')
        {
            $item['badge'] = (string) $badge;
        }
        if ($highlight)
        {
            $item['highlight'] = true;
        }
        if ($external)
        {
            $item['external'] = true;
        }

        return $item;
    }

    private function respondModernJSON($statusCode, $payload)
    {
        $statusCode = (int) $statusCode;
        if ($statusCode <= 0)
        {
            $statusCode = 200;
        }

        if (!headers_sent())
        {
            if (function_exists('http_response_code'))
            {
                http_response_code($statusCode);
            }
            else
            {
                header(sprintf('HTTP/1.1 %d', $statusCode));
            }
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }

        echo json_encode($payload);
    }

    private function rejectUnsupportedModernPage($modernPage)
    {
        if (!headers_sent())
        {
            header('HTTP/1.1 400 Bad Request');
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }

        echo json_encode(array(
            'error' => true,
            'message' => 'Unsupported modern page contract.',
            'requestedPage' => $modernPage
        ));
    }

    private function renderModernMutationJSON($contractKey, $modernPage, $routeURL, $success, $message, $actions = array())
    {
        $payload = array(
            'meta' => array(
                'contractVersion' => 1,
                'contractKey' => (string) $contractKey,
                'modernPage' => (string) $modernPage
            ),
            'success' => (bool) $success,
            'message' => (string) $message,
            'actions' => array_merge(
                array(
                    'routeURL' => (string) $routeURL
                ),
                $actions
            )
        );

        $this->respondModernJSON(200, $payload);
    }

    /*
     * Called by handleRequest() to process loading the site users page.
     */
    private function manageUsers()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));
        $users = new Users($this->_siteID);
        $rs = $users->getAll();
        $license = $users->getLicenseData();
        $userRoles = new UserRoles($this->_siteID);
        $userRolesEnabled = $userRoles->isSchemaAvailable() ? 1 : 0;
        $userIDs = array();
        foreach ($rs as $row)
        {
            $userIDs[] = (int) $row['userID'];
        }
        $userRoleNamesByUserID = $userRoles->getRoleNamesByUserIDs($userIDs);

        foreach ($rs as $rowIndex => $row)
        {
            $rs[$rowIndex]['successfulDate'] = DateUtility::fixZeroDate(
                $rs[$rowIndex]['successfulDate'], 'Never'
            );

            $rs[$rowIndex]['unsuccessfulDate'] = DateUtility::fixZeroDate(
                $rs[$rowIndex]['unsuccessfulDate'], 'Never'
            );

            // FIXME: The last test here might be redundant.
            // FIXME: Put this in a private method. It is duplicated twice so far.
            $siteIDPosition = strpos($row['username'], '@' .  $_SESSION['CATS']->getSiteID());

            if ($siteIDPosition !== false &&
                substr($row['username'], $siteIDPosition) == '@' . $_SESSION['CATS']->getSiteID())
            {
               $rs[$rowIndex]['username'] = str_replace(
                   '@' . $_SESSION['CATS']->getSiteID(), '', $row['username']
               );
            }

            $rs[$rowIndex]['applicationRole'] = '';
            if (isset($userRoleNamesByUserID[(int) $row['userID']]))
            {
                $rs[$rowIndex]['applicationRole'] = $userRoleNamesByUserID[(int) $row['userID']];
            }
        }

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-manage-users')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernManageUsersJSON(
                'settings-manage-users',
                $rs,
                $license,
                $userRolesEnabled
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'User Management');
        $this->_template->assign('rs', $rs);
        $this->_template->assign('license', $license);
        $this->_template->assign('userRolesEnabled', $userRolesEnabled);
        $this->_template->assign('currentUser', $this->_userID);
        $this->_template->display('./modules/settings/Users.tpl');
    }

    private function manageProfessional()
    {
        $wf = new WebForm();
        $wf->addField('licenseKey', 'License Key', WFT_TEXT, true, 60, 30, 190, '', '/[A-Za-z0-9 ]+/',
            'That is not a valid license key!');
        $message = '';
        $license = new License();

        $upgradeStatus = false;

        if (isset($_GET['webFormPostBack']))
        {
            list ($fields, $errors) = $wf->getValidatedFields();
            if (count($errors) > 0) $message = 'Please enter a license key in order to continue.';

            $key = trim($fields['licenseKey']);

            $configWritten = false;

            if ($license->setKey($key) === false)
            {
                $message = 'That is not a valid license key<br /><span style="font-size: 16px; color: #000000;">Please verify that you have the correct key and try again.</span>';
            }
            else if ($license->isProfessional())
            {
                if (!CATSUtility::isSOAPEnabled())
                {
                    $message = 'CATS Professional requires the PHP SOAP library which isn\'t currently installed.<br /><br />'
                        . 'Installation Instructions:<br /><br />'
                        . 'WAMP/Windows Users:<dl>'
                        . '<li>Left click on the wamp icon.</li>'
                        . '<li>Select "PHP Settings" from the drop-down list.</li>'
                        . '<li>Select "PHP Extensions" from the drop-down list.</li>'
                        . '<li>Check the "php_soap" option.</li>'
                        . '<li>Restart WAMP.</li></dl>'
                        . 'Linux Users:<br /><br />'
                        . 'Re-install PHP with the --enable-soap configuration option.<br /><br />'
                        . 'Please visit http://www.catsone.com for more support options.';
                }
                if (!LicenseUtility::validateProfessionalKey($key))
                {
                    $message = 'That is not a valid Professional membership key<br /><span style="font-size: 16px; color: #000000;">Please verify that you have the correct key and try again.</span>';
                }
                else if (!CATSUtility::changeConfigSetting('LICENSE_KEY', "'" . $key . "'"))
                {
                    $message = 'Internal Permissions Error<br /><span style="font-size: 12px; color: #000000;">CATS is unable '
                        . 'to write changes to your <b>config.php</b> file. Please change the file permissions or contact us '
                        . 'for support. Our support e-mail is <a href="mailto:support@catsone.com">support@catsone.com</a> '
                        . 'and our office number if (952) 417-0067.</span>';
                }
                else
                {
                    $upgradeStatus = true;
                }
            }
            else
            {
                $message = 'That is not a valid Professional membership key<br /><span style="font-size: 16px; color: #000000;">Please verify that you have the correct key and try again.</span>';
            }
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Professional Membership');
        $this->_template->assign('message', $message);
        $this->_template->assign('upgradeStatus', $upgradeStatus);
        $this->_template->assign('webForm', $wf);
        $this->_template->assign('license', $license);
        $this->_template->display('./modules/settings/Professional.tpl');
    }

    /*
     * Called by handleRequest() to process changing a user's password.
     */
    private function onChangePassword()
    {
        $users = new Users($this->_siteID);
        if(AUTH_MODE == 'ldap' || AUTH_MODE == 'sql+ldap')
        {
            if($users->isUserLDAP($this->_userID)) {
                $this->fatal(
                    'LDAP authentication is enabled. You are not allowed to change your password.'
                );
            }
        }

        $logout = false;

        $currentPassword = $this->getTrimmedInput(
            'currentPassword', $_POST
        );
        $newPassword = $this->getTrimmedInput(
            'newPassword', $_POST
        );
        $retypeNewPassword = $this->getTrimmedInput(
            'retypeNewPassword', $_POST
        );

        /* Bail out if we don't have a current password. */
        if (empty($currentPassword))
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid current password.');
        }

        /* Bail out if we don't have a new password. */
        if (empty($newPassword))
        {
            CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid new password.');
        }

        /* Bail out if we don't have a retyped new password. */
        if (empty($retypeNewPassword))
        {
            CommonErrors::fatal(COMMONERROR_NOPASSWORDMATCH, $this, 'Invalid retyped new password.');
        }

        /* Bail out if the two passwords don't match. */
        if ($retypeNewPassword !== $newPassword)
        {
            CommonErrors::fatal(COMMONERROR_NOPASSWORDMATCH, $this, 'Passwords do not match.');
        }

        /* Attempt to change the user's password. */
        $status = $users->changePassword(
            $this->_userID, $currentPassword, $newPassword
        );

        switch ($status)
        {
            case LOGIN_INVALID_PASSWORD:
                /* FIXME: No fatal()... we need a back button. */
                $error[] = 'The password that you specified for "Current Password" is incorrect.';
                break;

            case LOGIN_CANT_CHANGE_PASSWORD:
                /* FIXME: No fatal()... we need a back button. */
                $error[] = 'You are not allowed to change your password.';
                break;

            case LOGIN_INVALID_USER:
                $error[] = 'Your username appears to be invalid. Your password has not been changed and you have been logged out.';
                $messageSuccess = 'false';
                $logout = true;
                break;

            case LOGIN_DISABLED:
                $message = 'Your account is disabled. Your password cannot be changed and you have been logged out.';
                $messageSuccess = 'false';
                $logout = true;
                break;

            case LOGIN_SUCCESS:
                $message = 'Your password has been successfully changed. Please log in again using your new password.';
                $messageSuccess = 'true';
                $logout = true;
                break;

            default:
                $message = 'An unknown error occurred.';
                $messageSuccess = 'false';
                $logout = true;
                break;
        }

        if ($logout)
        {
            CATSUtility::transferRelativeURI(
                'm=logout&message=' . urlencode($message) .
                '&messageSuccess=' . urlencode($messageSuccess)
            );
        }
        else
        {
            $isDemoUser = $_SESSION['CATS']->isDemo();
            $this->_template->assign('userID', $this->_userID);
            $this->_template->assign('isDemoUser', $isDemoUser);

            $this->_template->assign('active', $this);
            $this->_template->assign('subActive', 'My Profile');
            $this->_template->assign('errorMessage', join('<br />', $error));
            $this->_template->display('./modules/settings/MyProfile.tpl');
        }
    }

    /*
     * Called by handleRequest() to process loading the login activity page.
     */
    private function loginActivity()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        if (isset($_GET['view']) && !empty($_GET['view']))
        {
            $view = $_GET['view'];
        }
        else
        {
            $view = '';
        }

        if ($this->isRequiredIDValid('page', $_GET))
        {
            $currentPage = $_GET['page'];
        }
        else
        {
            $currentPage = 1;
        }

        switch ($view)
        {
            case 'unsuccessful':
                $successful = false;
                break;

            case 'successful':
            default:
                $successful = true;
        }

        $loginActivityPager = new LoginActivityPager(
            LOGIN_ENTRIES_PER_PAGE, $currentPage, $this->_siteID, $successful
        );

        if ($loginActivityPager->isSortByValid('sortBy', $_GET))
        {
            $sortBy = $_GET['sortBy'];
        }
        else
        {
            $sortBy = 'dateSort';
        }

        if ($loginActivityPager->isSortDirectionValid('sortDirection', $_GET))
        {
            $sortDirection = $_GET['sortDirection'];
        }
        else
        {
            $sortDirection = 'DESC';
        }

        $loginActivityPager->setSortByParameters(
            'm=settings&amp;a=loginActivity&amp;view=' . $view,
            $sortBy,
            $sortDirection
        );

        $currentPage       = $loginActivityPager->getCurrentPage();
        $totalPages        = $loginActivityPager->getTotalPages();
        $validSortByFields = $loginActivityPager->getSortByFields();

        $rs = $loginActivityPager->getPage();

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-login-activity')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernLoginActivityJSON(
                'settings-login-activity',
                $view,
                $currentPage,
                $totalPages,
                (int) $loginActivityPager->getTotalRows(),
                $sortBy,
                $sortDirection,
                $validSortByFields,
                $rs
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Login Activity');
        $this->_template->assign('rs', $rs);
        $this->_template->assign('currentPage', $currentPage);
        $this->_template->assign('totalPages', $totalPages);
        $this->_template->assign('pager', $loginActivityPager);
        $this->_template->assign('view', $view);
        $this->_template->display('./modules/settings/LoginActivity.tpl');
    }

    /*
     * Called by handleRequest() to process loading the item history page.
     */
    private function viewItemHistory()
    {
        $responseFormat = strtolower($this->getTrimmedInput('format', $_GET));
        $modernPage = strtolower($this->getTrimmedInput('modernPage', $_GET));

        /* Bail out if we don't have a valid data item type. */
        if (!$this->isRequiredIDValid('dataItemType', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid data item type.');
        }

        /* Bail out if we don't have a valid data item ID. */
        if (!$this->isRequiredIDValid('dataItemID', $_GET))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Invalid data item ID.');
        }

        $dataItemType = $_GET['dataItemType'];
        $dataItemID   = $_GET['dataItemID'];

        switch ($dataItemType)
        {
            case DATA_ITEM_CANDIDATE:
                $candidates = new Candidates($this->_siteID);
                $data = $candidates->get($dataItemID);
                break;

            case DATA_ITEM_JOBORDER:
                $jobOrders = new JobOrders($this->_siteID);
                $data = $jobOrders->get($dataItemID);
                break;

            case DATA_ITEM_COMPANY:
                $companies = new Companies($this->_siteID);
                $data = $companies->get($dataItemID);
                break;

            case DATA_ITEM_CONTACT:
                $contacts = new Contacts($this->_siteID);
                $data = $contacts->get($dataItemID);
                break;

            default:
                CommonErrors::fatal(COMMONERROR_BADFIELDS, $this, 'Invalid data item type.');
                break;
        }

        /* Get revision information. */
        $history = new History($this->_siteID);
        $revisionRS = $history->getAll($dataItemType, $dataItemID);

        if ($responseFormat === 'modern-json')
        {
            if ($modernPage !== '' && $modernPage !== 'settings-view-item-history')
            {
                if (!headers_sent())
                {
                    header('HTTP/1.1 400 Bad Request');
                    header('Content-Type: application/json; charset=' . AJAX_ENCODING);
                    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
                }
                echo json_encode(array(
                    'error' => true,
                    'message' => 'Unsupported modern page contract.',
                    'requestedPage' => $modernPage
                ));
                return;
            }

            $this->renderModernViewItemHistoryJSON(
                'settings-view-item-history',
                $dataItemType,
                $dataItemID,
                $data,
                $revisionRS
            );
            return;
        }

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Login Activity');
        $this->_template->assign('data', $data);
        $this->_template->assign('revisionRS', $revisionRS);
        $this->_template->display('./modules/settings/ItemHistory.tpl');
    }

    private function wizard_addUser($respondModernJSON = false)
    {
        if (isset($_GET[$id = 'firstName'])) $firstName = $_GET[$id]; else $firstName = '';
        if (isset($_GET[$id = 'lastName'])) $lastName = $_GET[$id]; else $lastName = '';
        if (isset($_GET[$id = 'password'])) $password = $_GET[$id]; else $password = '';
        if (isset($_GET[$id = 'loginName'])) $loginName = $_GET[$id]; else $loginName = '';
        if (isset($_GET[$id = 'email'])) $email = $_GET[$id]; else $email = '';
        if (isset($_GET[$id = 'accessLevel']) && intval($_GET[$id]) < ACCESS_LEVEL_SA)
            $accessLevel = intval($_GET[$id]); else $accessLevel = ACCESS_LEVEL_READ;

        if (strlen($firstName) < 2 || strlen($lastName) < 2 || strlen($loginName) < 2 || strlen($password) < 2)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'invalidInput',
                    'First and last name are too short.'
                );
                return;
            }

            echo 'First and last name are too short.';
            return;
        }

        $users = new Users($this->_siteID);

        /* If adding an e-mail username, verify it is a valid e-mail. */
        if (strpos($loginName, '@') !== false && filter_var($loginName, FILTER_VALIDATE_EMAIL) === false)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'invalidLoginName',
                    'That is not a valid login name.'
                );
                return;
            }

            echo 'That is not a valid login name.';
            return;
        }

        /* Make it a multisite user name if the user is part of a hosted site. */
        $unixName = $_SESSION['CATS']->getUnixName();
        if (strpos($loginName, '@') === false && !empty($unixName))
        {
           $loginName .= '@' . $_SESSION['CATS']->getSiteID();
        }

        /* Bail out if the specified username already exists. */
        if ($users->usernameExists($loginName))
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'usernameExists',
                    'That username already exists.'
                );
                return;
            }

            echo 'That username already exists.';
            return;
        }

        $data = $users->getLicenseData();
        if ($data['totalUsers'] >= $data['userLicenses'])
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'licenseLimitReached',
                    'You cannot add any more users with your license.'
                );
                return;
            }

            echo 'You cannot add any more users with your license.';
            return;
        }

        if ($users->add($lastName, $firstName, $email, $loginName, $password, $accessLevel, false) !== -1)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    true,
                    'userAdded',
                    'User added.'
                );
                return;
            }

            echo 'Ok';
            return;
        }
        else
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'addFailed',
                    'Unable to add user. One of the fields you entered may have been formatted incorrectly.'
                );
                return;
            }

            echo 'Unable to add user. One of the fields you entered may have been formatted incorrectly.';
            return;
        }
    }

    private function wizard_deleteUser($respondModernJSON = false)
    {
        if (isset($_GET[$id = 'userID'])) $userID = intval($_GET[$id]);
        else
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'missingUserID',
                    'Unable to find the user you are trying to delete.'
                );
                return;
            }

            echo 'Unable to find the user you are trying to delete.';
            return;
        }

        if ($userID == $_SESSION['CATS']->getUserID())
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'selfDelete',
                    'You cannot delete yourself!'
                );
                return;
            }

            echo 'You cannot delete yourself!';
            return;
        }

        $users = new Users($this->_siteID);
        $users->delete($userID);

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'userDeleted',
                'User deleted.'
            );
            return;
        }

        echo 'Ok';
    }

    private function wizard_checkKey($respondModernJSON = false)
    {
        $fileError = false;

        if (isset($_GET[$id = 'key']) && $_GET[$id] != '')
        {
            $license = new License();
            $key = strtoupper(trim($_GET[$id]));

            $configWritten = false;

            if ($license->setKey($key) !== false)
            {
                if ($license->isProfessional())
                {
                    if (!CATSUtility::isSOAPEnabled())
                    {
                        if ($respondModernJSON)
                        {
                            $this->respondModernWizardJSON(
                                false,
                                'soapMissing',
                                "CATS Professional requires the PHP SOAP library which isn't currently installed.\n\n"
                                    . "Installation Instructions:\n\n"
                                    . "WAMP/Windows Users:\n"
                                    . "1) Left click on the wamp icon.\n"
                                    . "2) Select \"PHP Settings\" from the drop-down list.\n"
                                    . "3) Select \"PHP Extensions\" from the drop-down list.\n"
                                    . "4) Check the \"php_soap\" option.\n"
                                    . "5) Restart WAMP.\n\n"
                                    . "Linux Users:\n"
                                    . "Re-install PHP with the --enable-soap configuration option.\n\n"
                                    . "Please visit http://www.catsone.com for more support options."
                            );
                            return;
                        }

                        echo "CATS Professional requires the PHP SOAP library which isn't currently installed.\n\n"
                            . "Installation Instructions:\n\n"
                            . "WAMP/Windows Users:\n"
                            . "1) Left click on the wamp icon.\n"
                            . "2) Select \"PHP Settings\" from the drop-down list.\n"
                            . "3) Select \"PHP Extensions\" from the drop-down list.\n"
                            . "4) Check the \"php_soap\" option.\n"
                            . "5) Restart WAMP.\n\n"
                            . "Linux Users:\n"
                            . "Re-install PHP with the --enable-soap configuration option.\n\n"
                            . "Please visit http://www.catsone.com for more support options.";
                        return;
                    }
                    else
                    {
                        if (!LicenseUtility::validateProfessionalKey($key))
                        {
                            if ($respondModernJSON)
                            {
                                $this->respondModernWizardJSON(
                                    false,
                                    'invalidProfessionalKey',
                                    "That is not a valid CATS Professional license key. Please visit "
                                        . "http://www.catsone.com/professional for more information about CATS Professional.\n\n"
                                        . "For a free open-source key, please visit http://www.catsone.com/ and "
                                        . "click on \"Downloads\"."
                                );
                                return;
                            }

                            echo "That is not a valid CATS Professional license key. Please visit "
                                . "http://www.catsone.com/professional for more information about CATS Professional.\n\n"
                                . "For a free open-source key, please visit http://www.catsone.com/ and "
                                . "click on \"Downloads\".";
                            return;
                        }
                    }
                }

                if (CATSUtility::changeConfigSetting('LICENSE_KEY', "'" . $key . "'"))
                {
                    $configWritten = true;
                }
            }

            if ($configWritten)
            {
                if ($respondModernJSON)
                {
                    $this->respondModernWizardJSON(
                        true,
                        'licenseKeySaved',
                        'License key saved.'
                    );
                    return;
                }

                echo 'Ok';
                return;
            }
        }

        // The key hasn't been written. But they may have manually inserted the key into their config.php, check
        if (LicenseUtility::isLicenseValid())
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    true,
                    'licenseKeyValid',
                    'License key is valid.'
                );
                return;
            }

            echo 'Ok';
            return;
        }

        if ($fileError)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'configWriteFailed',
                    'You entered a valid key, but this wizard is unable to write to your config.php file! You have '
                        . 'two choices: ' . "\n\n"
                        . '1) Change the file permissions of your config.php file.'."\n".'If you\'re using unix, try:' . "\n" . 'chmod 777 config.php' . "\n\n"
                        . '2) Edit your config.php file manually and enter your valid key near this line: ' . "\n"
                        . 'define(\'LICENSE_KEY\', \'ENTER YOUR KEY HERE\');' . "\n" . 'Once you\'ve done this, refresh your browser.' . "\n\n"
                        . 'For more help, visit our website at http://www.catsone.com for support options.'
                );
                return;
            }

            echo 'You entered a valid key, but this wizard is unable to write to your config.php file! You have '
                . 'two choices: ' . "\n\n"
                . '1) Change the file permissions of your config.php file.'."\n".'If you\'re using unix, try:' . "\n" . 'chmod 777 config.php' . "\n\n"
                . '2) Edit your config.php file manually and enter your valid key near this line: ' . "\n"
                . 'define(\'LICENSE_KEY\', \'ENTER YOUR KEY HERE\');' . "\n" . 'Once you\'ve done this, refresh your browser.' . "\n\n"
                . 'For more help, visit our website at http://www.catsone.com for support options.';
        }

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                false,
                'invalidKey',
                'That is not a valid key. You can register for a free open source license key on our website '
                    . 'at http://www.catsone.com or a professional key to unlock all of the available features at '
                    . 'http://www.catsone.com/professional'
            );
            return;
        }

        echo 'That is not a valid key. You can register for a free open source license key on our website '
            . 'at http://www.catsone.com or a professional key to unlock all of the available features at '
            . 'http://www.catsone.com/professional';
    }

    private function wizard_localization($respondModernJSON = false)
    {
        if (!isset($_GET['timeZone']) || !isset($_GET['dateFormat']))
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'invalidInput',
                    "You didn't provide a time zone or date format."
                );
                return;
            }
            echo 'You didn\'t provide a time zone or date format.';
            return;
        }

        $timeZone = $_GET['timeZone'];
        $dateFormat = $_GET['dateFormat'];
        if ($dateFormat == 'mdy')
        {
            $isDMY = false;
        }
        else
        {
            $isDMY = true;
        }

        $site = new Site($this->_siteID);
        $site->setLocalization($timeZone, $isDMY);
        $site->setLocalizationConfigured();

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'localizationUpdated',
                'Localization settings saved.'
            );
            return;
        }

        echo 'Ok';
    }

    private function respondModernWizardJSON($success, $code, $message)
    {
        if (!headers_sent())
        {
            header('Content-Type: application/json; charset=' . AJAX_ENCODING);
            header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
        }

        echo json_encode(array(
            'success' => (bool) $success,
            'code' => (string) $code,
            'message' => (string) $message
        ));
    }

    private function wizard_license($respondModernJSON = false)
    {
        $site = new Site($this->_siteID);
        $site->setAgreedToLicense();

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'licenseAccepted',
                'License agreement accepted.'
            );
            return;
        }

        echo 'Ok';
    }

    private function wizard_firstTimeSetup($respondModernJSON = false)
    {
        $site = new Site($this->_siteID);
        $site->setFirstTimeSetup();

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'firstTimeSetupComplete',
                'First-time setup completed.'
            );
            return;
        }

        echo 'Ok';
    }

    private function wizard_password($respondModernJSON = false)
    {
        if (isset($_GET['password']) && !empty($_GET['password'])) $password = $_GET['password'];
        else $password = '';

        if (strlen($password) < 5)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'invalidPassword',
                    'Your password length must be at least 5 characters long.'
                );
                return;
            }

            echo 'Your password length must be at least 5 characters long.';
            return;
        }

        $users = new Users($this->_siteID);
        if ($users->changePassword($this->_userID, 'cats', $password) != LOGIN_SUCCESS)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'passwordChangeFailed',
                    'Cannot change your site password!'
                );
                return;
            }

            echo 'Cannot change your site password!';
            return;
        }

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'passwordUpdated',
                'Password updated.'
            );
            return;
        }

        echo 'Ok';
    }

    private function wizard_email($respondModernJSON = false)
    {
        if (isset($_GET['email']) && !empty($_GET['email'])) $email = $_GET['email'];
        else $email = '';

        if (strlen($email) < 5)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'invalidEmail',
                    'Your e-mail address must be at least 5 characters long.'
                );
                return;
            }
            echo 'Your e-mail address must be at least 5 characters long.';
            return;
        }

        $site = new Users($this->_siteID);
        $site->updateSelfEmail($this->_userID, $email);

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'emailUpdated',
                'E-mail address updated.'
            );
            return;
        }

        echo 'Ok';
    }

    private function wizard_siteName($respondModernJSON = false)
    {
        if (isset($_GET['siteName']) && !empty($_GET['siteName'])) $siteName = $_GET['siteName'];
        else $siteName = '';

        if ($siteName == 'default_site' || strlen($siteName) <= 0)
        {
            if ($respondModernJSON)
            {
                $this->respondModernWizardJSON(
                    false,
                    'invalidSiteName',
                    'That is not a valid site name. Please choose a different one.'
                );
                return;
            }

            echo 'That is not a valid site name. Please choose a different one.';
            return;
        }

        $site = new Site($this->_siteID);
        $site->setName($siteName);

        $companies = new Companies($this->_siteID);
        $companyIDInternal = $companies->add(
            'Internal Postings', '', '', '', '', '', '', '', '', '', '',
            '', '', 'Internal postings.', $this->_userID, $this->_userID
        );

        $companies->setCompanyDefault($companyIDInternal);

        $_SESSION['CATS']->setSiteName($siteName);

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'siteNameUpdated',
                'Site name updated.'
            );
            return;
        }

        echo 'Ok';
    }

    private function wizard_import($respondModernJSON = false)
    {
        $siteID = $_SESSION['CATS']->getSiteID();

        // Echos Ok to redirect to the import stage, or Fail to go to home module
        $files = ImportUtility::getDirectoryFiles(FileUtility::getUploadPath($siteID, 'massimport'));

        if ($respondModernJSON)
        {
            if (count($files))
            {
                $this->respondModernWizardJSON(
                    true,
                    'importReady',
                    'Import files are available.'
                );
            }
            else
            {
                $this->respondModernWizardJSON(
                    false,
                    'importNotReady',
                    'No import files were found.'
                );
            }

            return;
        }

        if (count($files)) echo 'Ok';
        else echo 'Fail';
    }

    private function wizard_website($respondModernJSON = false)
    {
        $website = trim(isset($_GET[$id='website']) ? $_GET[$id] : '');
        if (strlen($website) > 10)
        {
            if (!eval(Hooks::get('SETTINGS_CP_REQUEST')))
            {
                if ($respondModernJSON)
                {
                    $this->respondModernWizardJSON(
                        false,
                        'websiteRejected',
                        'Website update was rejected.'
                    );
                }

                return;
            }
        }

        if ($respondModernJSON)
        {
            $this->respondModernWizardJSON(
                true,
                'websiteUpdated',
                'Website updated.'
            );
            return;
        }

        echo 'Ok';
    }

    private function careerPortalQuestionnaire($fromPostback = false)
    {
        // Get the ID if provided, otherwise we're adding a questionnaire
        $questionnaireID = isset($_GET[$id='questionnaireID']) ? $_GET[$id] : '';

        $questions = array();

        if (!$fromPostback)
        {
            $title = $description = '';
            $isActive = 1;

            // If questionairreID is provided, this is an edit
            if ($questionnaireID != '')
            {
                $questionnaire = new Questionnaire($this->_siteID);
                if (count($data = $questionnaire->get($questionnaireID)))
                {
                    $questions = $questionnaire->getQuestions($questionnaireID);

                    for ($i=0; $i<count($questions); $i++)
                    {
                        $questions[$i]['questionTypeLabel'] = $questionnaire->convertQuestionConstantToType(
                            $questions[$i]['questionType']
                        );
                    }

                    $this->_template->assign('title', $title = $data['title']);
                    $this->_template->assign('description', $description = $data['description']);
                    $this->_template->assign('isActive', $isActive = $data['isActive']);
                    $this->_template->assign('questions', $questions);
                }
                else
                {
                    $questionnaireID = '';
                }
            }

            // Store the questionnaire in a sesssion. That way we can make post changes
            // without changing the database data. Only save the session to the DB if the
            // user requests it.
            if (isset($_SESSION['CATS_QUESTIONNAIRE'])) unset($_SESSION['CATS_QUESTIONNAIRE']);
            $_SESSION['CATS_QUESTIONNAIRE'] = array(
                'id' => $questionnaireID,
                'title' => $title,
                'description' => $description,
                'questions' => $questions,
                'isActive' => $isActive
            );
        }
        else
        {
            // This is being called from a postback, so we're actively working out of the
            // session. Postback will handle saves.
            if (!isset($_SESSION['CATS_QUESTIONNAIRE']) || empty($_SESSION['CATS_QUESTIONNAIRE']))
            {
                CommonErrors::fatal(COMMONERROR_BADINDEX, 'Please return to your careers website '
                    . 'and load the questionnaire a second time as your session has '
                    . 'expired.');
            }

            // Save/restore the scroll position of the page
            $scrollX = isset($_POST[$id = 'scrollX']) ? $_POST[$id] : '';
            $scrollY = isset($_POST[$id = 'scrollY']) ? $_POST[$id] : '';

            $questions = $_SESSION['CATS_QUESTIONNAIRE']['questions'];
            $questionnaireID = $_SESSION['CATS_QUESTIONNAIRE']['id'];

            $this->_template->assign('scrollX', $scrollX);
            $this->_template->assign('scrollY', $scrollY);
            $this->_template->assign('title', $_SESSION['CATS_QUESTIONNAIRE']['title']);
            $this->_template->assign('description', $_SESSION['CATS_QUESTIONNAIRE']['description']);
            $this->_template->assign('isActive', $_SESSION['CATS_QUESTIONNAIRE']['isActive']);
            $this->_template->assign('questions', $questions);
        }

        $this->_template->assign('questionnaireID', $questionnaireID);
        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', '');
        $this->_template->display('./modules/settings/CareerPortalQuestionnaire.tpl');
    }

    private function onCareerPortalQuestionnaire()
    {
        if (!isset($_SESSION['CATS_QUESTIONNAIRE']) || empty($_SESSION['CATS_QUESTIONNAIRE']))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, 'Please return to your careers website '
                . 'and load the questionnaire a second time as your session has '
                . 'expired.');
        }

        // Get the title
        $title = isset($_POST[$id = 'title']) ? substr(trim($_POST[$id]), 0, 255) : '';
        if (!strlen($title)) $title = '';

        // Get the description
        $description = isset($_POST[$id = 'description']) ? substr(trim($_POST[$id]), 0, 255) : '';
        if (!strlen($description)) $description = '';

        // Is this active?
        $active = isset($_POST[$id = 'isActive']) ? !strcasecmp($_POST[$id], 'yes') : 0;

        $_SESSION['CATS_QUESTIONNAIRE']['title'] = $title;
        $_SESSION['CATS_QUESTIONNAIRE']['description'] = $description;
        $_SESSION['CATS_QUESTIONNAIRE']['isActive'] = $active ? true : false;

        $questionnaire = new Questionnaire($this->_siteID);
        $questions = $_SESSION['CATS_QUESTIONNAIRE']['questions'];

        /**
         * STEP 1
         * Check for changes to question and answer texts, mark questions or
         * answers that the user specified to remove as "remove" which will be done
         * in the final step to prevent index changes.
         */
        for ($questionIndex=0; $questionIndex<count($questions); $questionIndex++)
        {
            // Update the position of the question
            $field = sprintf('question%dPosition', $questionIndex);
            if (isset($_POST[$field]))
            {
                $position = intval(trim($_POST[$field]));
                $questions[$questionIndex]['questionPosition'] = $position;
            }

            // Update the text of the question
            $field = sprintf('question%dTextValue', $questionIndex);
            if (isset($_POST[$field]))
            {
                if (strlen($text = substr(trim($_POST[$field]), 0, 255)))
                {
                    $questions[$questionIndex]['questionText'] = $text;
                }
            }

            // Update the type of the question
            $field = sprintf('question%dTypeValue', $questionIndex);
            if (isset($_POST[$field]))
            {
                $type = $questionnaire->convertQuestionTypeToConstant($_POST[$field]);
                $questions[$questionIndex]['questionType'] = $type;
                $questions[$questionIndex]['questionTypeLabel'] = (
                    $questionnaire->convertQuestionConstantToType($type)
                );
            }

            // Check if this question should be removed (user checked the box)
            $field = sprintf('question%dRemove', $questionIndex);
            if (isset($_POST[$field]) && !strcasecmp($_POST[$field], 'yes'))
            {
                $questions[$questionIndex]['remove'] = true;
            }
            else
            {
                $questions[$questionIndex]['remove'] = false;
            }

            for ($answerIndex=0; $answerIndex<count($questions[$questionIndex]['answers']); $answerIndex++)
            {
                // Update the position of the question
                $field = sprintf('question%dAnswer%dPosition', $questionIndex, $answerIndex);
                if (isset($_POST[$field]))
                {
                    $position = intval(trim($_POST[$field]));
                    $questions[$questionIndex]['answers'][$answerIndex]['answerPosition'] = $position;
                }

                // Update the text of the answer
                $field = sprintf('question%dAnswer%dTextValue', $questionIndex, $answerIndex);
                if (isset($_POST[$field]))
                {
                    if (strlen($text = substr(trim($_POST[$field]), 0, 255)))
                    {
                        $questions[$questionIndex]['answers'][$answerIndex]['answerText'] = $text;
                    }
                }

                // Check if this answer should be removed (user checked the box)
                $field = sprintf('question%dAnswer%dRemove', $questionIndex, $answerIndex);
                if (isset($_POST[$field]) && !strcasecmp($_POST[$field], 'yes'))
                {
                    $questions[$questionIndex]['answers'][$answerIndex]['remove'] = true;
                }
                else
                {
                    $questions[$questionIndex]['answers'][$answerIndex]['remove'] = false;
                }

                // Check the actions for whether or not they should exist
                $actionSourceField = sprintf('question%dAnswer%dActionSource',
                    $questionIndex, $answerIndex
                );
                $actionNotesField = sprintf('question%dAnswer%dActionNotes',
                    $questionIndex, $answerIndex
                );
                $actionIsHotField = sprintf('question%dAnswer%dActionIsHot',
                    $questionIndex, $answerIndex
                );
                $actionIsActiveField = sprintf('question%dAnswer%dActionIsActive',
                    $questionIndex, $answerIndex
                );
                $actionCanRelocateField = sprintf('question%dAnswer%dActionCanRelocate',
                    $questionIndex, $answerIndex
                );
                $actionKeySkillsField = sprintf('question%dAnswer%dActionKeySkills',
                    $questionIndex, $answerIndex
                );

                $actionSourceActive = isset($_POST[$id = $actionSourceField . 'Active']) ? $_POST[$id] : '';
                $actionNotesActive = isset($_POST[$id = $actionNotesField . 'Active']) ? $_POST[$id] : '';
                $actionIsHotActive = isset($_POST[$id = $actionIsHotField . 'Active']) ? $_POST[$id] : '';
                $actionIsActiveActive = isset($_POST[$id = $actionIsActiveField . 'Active']) ? $_POST[$id] : '';
                $actionCanRelocateActive = isset($_POST[$id = $actionCanRelocateField . 'Active']) ? $_POST[$id] : '';
                $actionKeySkillsActive = isset($_POST[$id = $actionKeySkillsField . 'Active']) ? $_POST[$id] : '';

                $actionSourceValue = isset($_POST[$id = $actionSourceField . 'Value']) ? $_POST[$id] : '';
                $actionNotesValue = isset($_POST[$id = $actionNotesField . 'Value']) ? $_POST[$id] : '';
                $actionIsHotValue = isset($_POST[$id = $actionIsHotField . 'Value']) ? $_POST[$id] : '';
                $actionIsActiveValue = isset($_POST[$id = $actionIsActiveField . 'Value']) ? $_POST[$id] : '';
                $actionCanRelocateValue = isset($_POST[$id = $actionCanRelocateField . 'Value']) ? $_POST[$id] : '';
                $actionKeySkillsValue = isset($_POST[$id = $actionKeySkillsField . 'Value']) ? $_POST[$id] : '';

                $questions[$questionIndex]['answers'][$answerIndex]['actionSource'] = (
                    strcasecmp($actionSourceActive, 'yes') ?
                    '' :
                    $actionSourceValue
                );
                $questions[$questionIndex]['answers'][$answerIndex]['actionNotes'] = (
                    strcasecmp($actionNotesActive, 'yes') ?
                    '' :
                    $actionNotesValue
                );
                $questions[$questionIndex]['answers'][$answerIndex]['actionIsHot'] = (
                    strcasecmp($actionIsHotActive, 'yes') ?
                    0 :
                    1
                );
                $questions[$questionIndex]['answers'][$answerIndex]['actionIsActive'] = (
                    strcasecmp($actionIsActiveActive, 'yes') ?
                    1 :
                    0
                );
                $questions[$questionIndex]['answers'][$answerIndex]['actionCanRelocate'] = (
                    strcasecmp($actionCanRelocateActive, 'yes') ?
                    0 :
                    1
                );
                $questions[$questionIndex]['answers'][$answerIndex]['actionKeySkills'] = (
                    strcasecmp($actionKeySkillsActive, 'yes') ?
                    '' :
                    $actionKeySkillsValue
                );
            }
        }

        /**
         * STEP 2
         * Perform addition requests like add question, answer or action. We do this before
         * performing the removal step because if a user removes a question and adds a answer
         * to it in the same step, the indexes will be misaligned. This way, the addition is
         * processed and then immediately removed if requested by the user (which is naughty).
         */
        $restrictAction = isset($_POST[$id = 'restrictAction']) ? $_POST[$id] : '';
        $restrictQuestionID = isset($_POST[$id = 'restrictActionQuestionID']) ? intval($_POST[$id]) : '';
        $restrictAnswerID = isset($_POST[$id = 'restrictActionAnswerID']) ? intval($_POST[$id]) : '';

        if (!strcasecmp($restrictAction, 'question'))
        {
            // Adding a new question to the questionnaire
            $questionText = isset($_POST[$id = 'questionText']) ? trim($_POST[$id]) : '';
            $questionTypeText = isset($_POST[$id = 'questionType']) ? $_POST[$id] : '';

            // Make sure the question doesn't already exist (re-submit)
            for ($i = 0, $exists = false; $i < count($questions); $i++)
            {
                if (!strcmp($questions[$i]['questionText'], $questionText))
                {
                    $exists = true;
                }
            }

            if (strlen($questionText) && !$exists)
            {
                $questions[] = array(
                    'questionID' => -1, // -1 indicates a record needs to be added
                    'questionType' => QUESTIONNAIRE_QUESTION_TYPE_TEXT,
                    'questionTypeLabel' =>
                        $questionnaire->convertQuestionConstantToType(QUESTIONNAIRE_QUESTION_TYPE_TEXT),
                    'questionText' => $questionText,
                    'minimumLength' => 0,
                    'maximumLength' => 255,
                    'questionPosition' => 1000, // should be positioned last (users can't enter higher than 999)
                    'answers' => array()
                );
            }
        }
        else if (!strcasecmp($restrictAction, 'answer') &&
            isset($questions[$restrictQuestionID]))
        {
            // Adding a new answer to an existing question
            $field = sprintf('question%dAnswerText', $restrictQuestionID);
            $answerText = substr(trim(isset($_POST[$field]) ? $_POST[$field] : ''), 0, 255);

            if (strlen($answerText))
            {
                $questions[$restrictQuestionID]['answers'][] = array(
                    'answerID' => -1, // append to the db
                    'answerText' => $answerText,
                    'actionSource' => '',
                    'actionNotes' => '',
                    'actionIsHot' => 0,
                    'actionIsActive' => 1,
                    'actionCanRelocate' => 0,
                    'actionKeySkills' => '',
                    'answerPosition' => 1000 // should be positioned last (see above)
                );
            }
        }
        else if (!strcasecmp($restrictAction, 'action') &&
            isset($questions[$restrictQuestionID]) &&
            isset($questions[$restrictQuestionID]['answers'][$restrictAnswerID]))
        {
            // Adding a new action to an existing answer of an existing question
            $field = sprintf('question%dAnswer%d', $restrictQuestionID, $restrictAnswerID);
            $newAction = isset($_POST[$id = $field . 'NewAction']) ? $_POST[$id] : '';
            $actionText = substr(trim(isset($_POST[$id = $field . 'NewActionText']) ? $_POST[$id] : ''), 0, 255);

            if (isset($questions[$restrictQuestionID]['answers'][$restrictAnswerID][$newAction]))
            {
                switch ($newAction)
                {
                    case 'actionSource': case 'actionNotes': case 'actionKeySkills':
                        $value = $actionText;
                        break;

                    case 'actionIsActive':
                        $value = 0;
                        break;

                    default:
                        $value = 1;
                        break;
                }

                $questions[$restrictQuestionID]['answers'][$restrictAnswerID][$newAction] = $value;
            }
        }

        /**
         * STEP 5
         * Remove any questions/answers that have "remove" checked prior to sorting/positioning
         */
        $savedQuestions = array();
        for ($questionIndex = 0, $savedQuestionIndex = 0;
             $questionIndex < count($questions);
             $questionIndex++)
        {
            if (isset($questions[$questionIndex]['remove']) && $questions[$questionIndex]['remove']) continue;
            $savedQuestions[$savedQuestionIndex] = $questions[$questionIndex];
            $savedQuestions[$savedQuestionIndex]['answers'] = array();

            for ($answerIndex = 0; $answerIndex < count($questions[$questionIndex]['answers']); $answerIndex++)
            {
                if (isset($questions[$questionIndex]['answers'][$answerIndex]['remove']) &&
                    $questions[$questionIndex]['answers'][$answerIndex]['remove']) continue;
                $savedQuestions[$savedQuestionIndex]['answers'][] =
                    $questions[$questionIndex]['answers'][$answerIndex];
            }

            $savedQuestionIndex++;
        }
        $questions = $savedQuestions;

        /**
         * STEP 6
         * Corrections. Any removals or changes that have altered the "way of things" need to
         * be fixed before sort.
         */
        for ($questionIndex = 0; $questionIndex < count($questions); $questionIndex++)
        {
            // If the question has no answers it is a TEXT automatically
            if (!count($questions[$questionIndex]['answers']))
            {
                $questions[$questionIndex]['questionType'] = QUESTIONNAIRE_QUESTION_TYPE_TEXT;
                $questions[$questionIndex]['questionTypeLabel'] =
                    $questionnaire->convertQuestionConstantToType(QUESTIONNAIRE_QUESTION_TYPE_TEXT);
            }
            // Otherwise, if there are answers, it cannot be a TEXT
            else if ($questions[$questionIndex]['questionType'] == QUESTIONNAIRE_QUESTION_TYPE_TEXT)
            {
                $questions[$questionIndex]['questionType'] = QUESTIONNAIRE_QUESTION_TYPE_SELECT;
                $questions[$questionIndex]['questionTypeLabel'] =
                    $questionnaire->convertQuestionConstantToType(QUESTIONNAIRE_QUESTION_TYPE_SELECT);
            }
        }

        /**
         * STEP 7
         * Perform a bubble sort on the questions and answers. Then provide real values
         * (1, 2, 3) based on the results.
         */
        for ($questionIndex2 = 0;
             $questionIndex2 < count($questions);
             $questionIndex2++)
        {
            if ($questionIndex2 < count($questions) - 1)
            {
                for ($questionIndex3 = 0;
                     $questionIndex3 < count($questions) - 1;
                     $questionIndex3++)
                {
                    if (intval($questions[$questionIndex3]['questionPosition']) >
                        intval($questions[$questionIndex3+1]['questionPosition']))
                    {
                        $tmp = $questions[$questionIndex3];
                        $questions[$questionIndex3] = $questions[$questionIndex3+1];
                        $questions[$questionIndex3+1] = $tmp;
                    }
                }
            }

            // Bubble sort the answers for each question using the same method
            for ($answerIndex2 = 0;
                 $answerIndex2 < count($questions[$questionIndex2]['answers']) - 1;
                 $answerIndex2++)
            {
                for ($answerIndex3 = 0;
                     $answerIndex3 < count($questions[$questionIndex2]['answers']) - 1;
                     $answerIndex3++)
                {
                    if (intval($questions[$questionIndex2]['answers'][$answerIndex3]['answerPosition']) >
                        intval($questions[$questionIndex2]['answers'][$answerIndex3+1]['answerPosition']))
                    {
                        $tmp = $questions[$questionIndex2]['answers'][$answerIndex3];
                        $questions[$questionIndex2]['answers'][$answerIndex3] =
                            $questions[$questionIndex2]['answers'][$answerIndex3+1];
                        $questions[$questionIndex2]['answers'][$answerIndex3+1] = $tmp;
                    }
                }
            }
        }

        // Now define real position values (never trust the naughty user)
        for ($questionIndex2 = 0;
             $questionIndex2 < count($questions);
             $questionIndex2++)
        {
            $questions[$questionIndex2]['questionPosition'] = $questionIndex2 + 1;

            for ($answerIndex2 = 0;
                 $answerIndex2 < count($questions[$questionIndex2]['answers']);
                 $answerIndex2++)
            {
                $questions[$questionIndex2]['answers'][$answerIndex2]['answerPosition'] = ($answerIndex2 + 1);
            }
        }

        if (isset($_POST[$id = 'startOver']) && !strcasecmp($_POST[$id], 'yes'))
        {
            // User wants to start over
            $_SESSION['CATS_QUESTIONNAIRE']['questions'] = array();
        }
        else if (isset($_POST[$id = 'saveChanges']) && !strcasecmp($_POST[$id], 'yes'))
        {
            // User wants to add the new questionnaire
            if (($id = intval($_SESSION['CATS_QUESTIONNAIRE']['id'])) != 0)
            {
                $questionnaire->update(
                    $id, // the questionnaire id to update
                    $_SESSION['CATS_QUESTIONNAIRE']['title'],
                    $_SESSION['CATS_QUESTIONNAIRE']['description'],
                    $_SESSION['CATS_QUESTIONNAIRE']['isActive']
                );
            }
            // User is editting an existing questionnaire
            else
            {
                $id = $questionnaire->add(
                    $_SESSION['CATS_QUESTIONNAIRE']['title'],
                    $_SESSION['CATS_QUESTIONNAIRE']['description'],
                    $_SESSION['CATS_QUESTIONNAIRE']['isActive']
                );
            }

            if ($id !== false)
            {
                // Delete all existing questions/answers (replace with session values)
                $questionnaire->deleteQuestions($id);

                // Save the questions to the new or old questionnaire
                $questionnaire->addQuestions(
                    $id,
                    $_SESSION['CATS_QUESTIONNAIRE']['questions']
                );

                CATSUtility::transferRelativeURI('m=settings&a=careerPortalSettings');
                return;
            }
        }
        else
        {
            // Now save changes to the session
            $_SESSION['CATS_QUESTIONNAIRE']['questions'] = $questions;
        }

        // Now view the page as if we've just loaded it from the database
        $this->careerPortalQuestionnaire(true);
    }

    private function careerPortalQuestionnaireUpdate()
    {
        $questionnaire = new Questionnaire($this->_siteID);
        $data = $questionnaire->getAll(true);

        for ($i = 0; $i < count($data); $i++)
        {
            if (isset($_POST[$id = 'removeQuestionnaire' . $i]) &&
                !strcasecmp($_POST[$id], 'yes'))
            {
                $questionnaire->delete($data[$i]['questionnaireID']);
            }
        }

        CATSUtility::transferRelativeURI('m=settings&a=careerPortalSettings');
    }

    private function careerPortalQuestionnairePreview()
    {
        if (!isset($_GET['questionnaireID']))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX, $this, 'Bad index.');
        }

        $questionnaireID = intval($_GET['questionnaireID']);
        $questionnaire = new Questionnaire($this->_siteID);
        $data = $questionnaire->get($questionnaireID);

        if (empty($data))
        {
            CommonErrors::fatal(COMMONERROR_BADINDEX);
        }

        $questions = $questionnaire->getQuestions($questionnaireID);

        $this->_template->assign('active', $this);
        $this->_template->assign('subActive', 'Administration');
        $this->_template->assign('isModal', false);
        $this->_template->assign('questionnaireID', $questionnaireID);
        $this->_template->assign('data', $data);
        $this->_template->assign('questions', $questions);
        $this->_template->display('./modules/settings/CareerPortalQuestionnaireShow.tpl');
    }
}

?>
