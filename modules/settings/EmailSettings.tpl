<?php /* $Id: EmailSettings.tpl 3310 2007-10-25 21:24:20Z brian $ */ ?>
<?php TemplateUtility::printHeader('Settings', array('modules/settings/validator.js', 'modules/settings/Settings.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active, $this->subActive); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/settings.gif" width="24" height="24" border="0" alt="Settings" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>Settings: Administration</h2></td>
                </tr>
            </table>

            <p class="note">E-Mail Settings</p>

            <table>
                <tr>
                    <td>
                        <form name="emailSettingsForm" id="emailSettingsForm" action="<?php echo(CATSUtility::getIndexName()); ?>?m=settings&amp;a=emailSettings" method="post">
                            <input type="hidden" name="postback" value="postback" />
                            <input type="hidden" name="configured" value="1" />

                            <table class="editTable" width="700">
                                <tr id="fromAddressRow">
                                    <td class="tdVertical" style="width: 175px;">
                                        <label for="fromAddress" id="fromAddressLabel">From E-Mail Address for Outgoing Messages:</label>
                                    </td>
                                    <td class="tdData">
                                        <input type="text" class="inputbox" name="fromAddress" id="fromAddress" value="<?php $this->_($this->mailerSettingsRS['fromAddress']); ?>" style="width: 180px;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td class="tdVertical" style="width: 175px;">&nbsp;</td>
                                    <td class="tdData">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td class="tdVertical" style="width: 175px;">&nbsp;</td>
                                    <td class="tdData">
                                        <span>Send Test E-Mail To:</span><br/>
                                        <input type="text" class="inputbox" name="testEmailAddress" id="testEmailAddress" value="" style="margin-bottom: 6px; width: 180px;" />
                                        <span id="testButtonSpanActive" style="display:none;">
                                            &nbsp;<img src="images/indicator2.gif">
                                        </span><br />
                                        <span id="testButtonSpan">
                                            <input type="button" class="button" name="test" id="test" onclick="testEmailSettings('<?php echo($this->sessionCookie); ?>');" value="Test Configuration" />
                                        </span>
                                        <div id="testOutput">
                                        </div>
                                        <div id="divider">
                                            <br />
                                            <br />
                                        </div>
                                    </td>
                                </tr>
                                
                                <tr id="fromAddressRow">
                                    <td class="tdVertical" style="width: 175px;">
                                        <label>E-Mail Messages Generated for:</label>
                                    </td>
                                    <td class="tdData">
                                        <input type="checkbox" name="statusChangeAllocated" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_ALLOCATED]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_ALLOCATED]==1): ?>checked<?php endif; ?>>Status Change: Allocated<br />
                                        <input type="checkbox" name="statusChangeDeliveryValidated" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_DELIVERY_VALIDATED]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_DELIVERY_VALIDATED]==1): ?>checked<?php endif; ?>>Status Change: Delivery Validated<br />
                                        <input type="checkbox" name="statusChangeProposedToCustomer" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_PROPOSED_TO_CUSTOMER]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_PROPOSED_TO_CUSTOMER]==1): ?>checked<?php endif; ?>>Status Change: Proposed to Customer<br />
                                        <input type="checkbox" name="statusChangeCustomerInterview" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_CUSTOMER_INTERVIEW]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_CUSTOMER_INTERVIEW]==1): ?>checked<?php endif; ?>>Status Change: Customer Interview<br />
                                        <input type="checkbox" name="statusChangeCustomerApproved" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_CUSTOMER_APPROVED]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_CUSTOMER_APPROVED]==1): ?>checked<?php endif; ?>>Status Change: Customer Approved<br />
                                        <input type="checkbox" name="statusChangeAvelApproved" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_AVEL_APPROVED]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_AVEL_APPROVED]==1): ?>checked<?php endif; ?>>Status Change: Avel Approved<br />
                                        <input type="checkbox" name="statusChangeOfferNegotiation" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_OFFER_NEGOTIATION]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_OFFER_NEGOTIATION]==1): ?>checked<?php endif; ?>>Status Change: Offer Negotiation<br />
                                        <input type="checkbox" name="statusChangeOfferAccepted" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_OFFER_ACCEPTED]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_OFFER_ACCEPTED]==1): ?>checked<?php endif; ?>>Status Change: Offer Accepted<br />
                                        <input type="checkbox" name="statusChangeHired" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_HIRED]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_HIRED]==1): ?>checked<?php endif; ?>>Status Change: Hired<br />
                                        <input type="checkbox" name="statusChangeRejected" <?php if(isset($this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_REJECTED]) && $this->candidateJoborderStatusSendsMessage[PIPELINE_STATUS_REJECTED]==1): ?>checked<?php endif; ?>>Status Change: Rejected<br />
                                        <?php foreach ($this->emailTemplatesRS as $index => $data): ?>
                                            <input type="checkbox" name="useThisTemplate<?php echo($data['emailTemplateID']); ?>" id="useThisTemplate<?php echo($data['emailTemplateID']); ?>" <?php if ($data['disabled'] == 0) echo('checked'); ?>> <?php echo($data['emailTemplateTitle']); ?><br />
                                        <?php endforeach; ?>
                                  </td>
                                </tr>
                            </table>
                            <input type="submit" class="button" name="submit" id="submit" value="Save" />&nbsp;
                            <input type="reset"  class="button" name="reset"  id="reset"  value="Reset" />&nbsp;
                        </form>
                    </td>
                </tr>
            </table>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

