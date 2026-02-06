<?php /* $Id: Candidates.tpl 3445 2007-11-06 23:17:04Z will $ */ ?>
<?php TemplateUtility::printHeader('Candidates', array( 'js/highlightrows.js', 'js/export.js', 'js/dataGrid.js', 'js/dataGridFilters.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
<?php $md5InstanceName = md5($this->dataGrid->getInstanceName());?>
    <style type="text/css">
    div.addCandidateButton { background: #4172E3 url(images/nodata/candidatesButton.jpg); cursor: pointer; width: 337px; height: 67px; }
    div.addCandidateButton:hover { background: #4172E3 url(images/nodata/candidateButton-o.jpg); cursor: pointer; width: 337px; height: 67px; }
    div.addMassImportButton { background: #4172E3 url(images/nodata/addMassImport.jpg); cursor: pointer; width: 337px; height: 67px; }
    div.addMassImportButton:hover { background: #4172E3 url(images/nodata/addMassImport-o.jpg); cursor: pointer; width: 337px; height: 67px; }
    </style>
    <div id="main">
        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?><?php echo !$this->totalCandidates ? ' style="background-color: #E6EEFF; padding: 0px;"' : ''; ?>>
            <?php if ($this->totalCandidates): ?>
            <div class="ui2-page-header">
                <div class="ui2-datatable-toolbar ui2-datatable-toolbar--no-search">
                    <div class="ui2-datatable-title">
                        <div class="ui2-datatable-title-row">
                            <img src="images/candidate.gif" width="24" height="24" alt="Candidates" style="border: none; margin-top: 3px;" />
                            <div>
                                <h2>Candidates: Home</h2>
                                <div class="ui2-datatable-meta">
                                    Candidates - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?> (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="ui2-datatable-actions">
                        <div class="ui2-header-utilities">
                            <form class="ui2-header-search" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get" autocomplete="off">
                                <input type="hidden" name="m" value="candidates" />
                                <input type="hidden" name="a" value="search" />
                                <input type="hidden" name="mode" value="searchByFullName" />
                                <input type="text" name="wildCardString" class="ui2-input" placeholder="Search candidates..." />
                                <button type="submit" class="ui2-button ui2-button--secondary">Search</button>
                            </form>
                            <?php TemplateUtility::printRecentDropdown('candidates'); ?>
                        </div>
                        <?php if ($this->getUserAccessLevel('candidates.add') >= ACCESS_LEVEL_EDIT): ?>
                            <a class="ui2-button ui2-button--primary" href="<?php echo CATSUtility::getIndexName(); ?>?m=candidates&amp;a=add">Add Candidate</a>
                        <?php endif; ?>
                        <?php $this->dataGrid->drawShowFilterControl(); ?>
                        <?php $this->dataGrid->drawRowsPerPageSelector(); ?>
                    </div>
                </div>

                <form name="candidatesViewSelectorForm" id="candidatesViewSelectorForm" action="<?php echo(CATSUtility::getIndexName()); ?>" method="get">
                    <input type="hidden" name="m" value="candidates" />
                    <input type="hidden" name="a" value="listByView" />
                    <div class="ui2-datatable-filters">
                        <div class="ui2-datatable-nav">
                            <?php $this->dataGrid->printNavigation(false); ?>
                        </div>
                        <label class="ui2-inline">
                            <input type="checkbox" name="onlyMyCandidates" id="onlyMyCandidates" <?php if ($this->dataGrid->getFilterValue('OwnerID') ==  $this->userID): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('OwnerID', '==',  $this->userID); ?>" />
                            Only My Candidates
                        </label>
                        <label class="ui2-inline" for="onlyHotCandidates">
                            <input type="checkbox" name="onlyHotCandidates" id="onlyHotCandidates" <?php if ($this->dataGrid->getFilterValue('IsHot') == '1'): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('IsHot', '==', '\'1\''); ?>" />
                            Only Hot Candidates
                        </label>
                        <label class="ui2-inline" for="onlyGdprUnsigned">
                            <input type="checkbox" name="onlyGdprUnsigned" id="onlyGdprUnsigned" <?php if ($this->dataGrid->getFilterValue('GdprSigned') == '0'): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('GdprSigned', '==', '\'0\''); ?>" />
                            GDPR Not Signed
                        </label>
                        <label class="ui2-inline" for="onlyActiveCandidates">
                            <input type="checkbox" name="onlyActiveCandidates" id="onlyActiveCandidates" <?php if ($this->dataGrid->getFilterValue('IsActive') == '1'): ?>checked<?php endif; ?> onclick="<?php echo $this->dataGrid->getJSAddRemoveFilterFromCheckbox('IsActive', '==', '\'1\''); ?>" />
                            Active Candidates
                        </label>
                        <div class="ui2-datatable-tagfilter">
                            <a href="javascript:void(0);" id="exportBoxLink<?= $md5InstanceName ?>" onclick="toggleHideShowControls('<?= $md5InstanceName ?>-tags'); return false;">Filter by tag</a>
                            <div id="tagsContainer" style="position:relative">
                            <div class="ajaxSearchResults" id="ColumnBox<?= $md5InstanceName ?>-tags" align="left"  style="position:absolute;width:200px;right:0<?= isset($this->globalStyle)?$this->globalStyle:"" ?>">
                                <table width="100%"><tr><td style="font-weight:bold; color:#000000;">Tag list</td>
                                <td align="right">
                                    <input type="button" onclick="applyTagFilter()" value="Save&amp;Close" />
                                    <input type="button" onclick="document.getElementById('ColumnBox<?= $md5InstanceName?>').style.display='none';" value="Close" />
                                </td>
                                </tr></table>


                                <ul>
                                <script type="text/javascript">
                                function applyTagFilter(){
                                    var arrValues=[];
                                    var tags=document.getElementsByName('candidate_tags[]');
                                    for(var el in tags){
                                        if (tags[el].checked) arrValues.push(tags[el].value);
                                    };

                                    <?php echo $this->dataGrid->getJSAddFilter('Tags', '=#',  "arrValues.join('/')")?>;
                                }
                                </script>
                                <?php $i=1;

                                function drw($data, $id){
                                    global $i;
                                    foreach($data as $k => $v){
                                        if ($v['tag_parent_id'] == $id){
                                            ?><li><input type="checkbox" name="candidate_tags[]" id="checkbox<?= $i ?>" value="<?= $v['tag_id'] ?>"><label for="checkbox<?= $i++ ?>"><?= $v['tag_title'] ?></label></li><?php
                                            echo "\n<ul>";
                                            drw($data, $v['tag_id']);
                                            echo "\n</ul>";
                                        }
                                    }
                                }
                                drw($this->tagsRS, '');
                                ?></ul>
                            </div>
                            </div>
                            <span style="display:none;" id="ajaxTableIndicator<?= $md5InstanceName ?>"><img src="images/indicator_small.gif" alt="" /></span>
                        </div>
                    </div>
                </form>
            </div>

            <?php if ($this->topLog != ''): ?>
            <div style="margin: 20px 0px 20px 0px;">
                <?php echo $this->topLog; ?>
            </div>
            <?php endif; ?>

            <?php if ($this->errMessage != ''): ?>
            <div id="errorMessage" style="padding: 25px 0px 25px 0px; border-top: 1px solid #800000; border-bottom: 1px solid #800000; background-color: #f7f7f7;margin-bottom: 15px;">
            <table>
                <tr>
                    <td align="left" valign="center" style="padding-right: 5px;">
                        <img src="images/large_error.gif" align="left">
                    </td>
                    <td align="left" valign="center">
                        <span style="font-size: 12pt; font-weight: bold; color: #800000; line-height: 12pt;">There was a problem with your request:</span>
                        <div style="font-size: 10pt; font-weight: bold; padding: 3px 0px 0px 0px;"><?php echo $this->errMessage; ?></div>
                    </td>
                </tr>
            </table>
            </div>
            <?php endif; ?>

            <div class="ui2-datatable-filterarea">
                <?php $this->dataGrid->drawFilterArea(); ?>
            </div>
            <div class="ui2-card ui2-datatable-card ui2-datatable-card--avel">
                <?php $this->dataGrid->draw();  ?>
            </div>

            <div class="ui2-datatable-footer">
                <div class="ui2-datatable-footer-left">
                    <?php $this->dataGrid->printActionArea(); ?>
                </div>
                <div class="ui2-datatable-footer-right">
                    <?php $this->dataGrid->printNavigation(true); ?>
                </div>
            </div>

            <?php else: ?>

            <br /><br /><br /><br />
            <div style="height: 95px; background: #E6EEFF url(images/nodata/candidatesTop.jpg);">
                &nbsp;
            </div>
            <br /><br />
                <?php if ($this->getUserAccessLevel('candidates.add') >= ACCESS_LEVEL_EDIT): ?>
            <table cellpadding="0" cellspacing="0" border="0" width="956">
                <tr>
                <td style="padding-left: 62px;" align="center" valign="center">

                    <div style="text-align: center; width: 600px; line-height: 22px; font-size: 18px; font-weight: bold; color: #666666; padding-bottom: 20px;">
                    Add candidates to keep track of possible applicants you can consider for your job orders.
                    </div>

                    <table cellpadding="10" cellspacing="0" border="0">
                        <tr>
                            <td style="padding-right: 20px;">
                                <a href="<?php echo CATSUtility::getIndexName(); ?>?m=candidates&amp;a=add">
                                <div class="addCandidateButton">&nbsp;</div>
                                </a>
                            </td>
                            <td>
                                <a href="<?php echo CATSUtility::getIndexName(); ?>?m=import&amp;a=massImport">
                                <div class="addMassImportButton">&nbsp;</div>
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>

                </tr>
            </table>
                <?php endif; ?>

            <?php endif; ?>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

