<?php /* $Id: Home.tpl 3563 2007-11-12 07:41:54Z will $ */ ?>
<?php TemplateUtility::printHeader('Overview', array('js/sweetTitles.js', 'js/dataGrid.js', 'js/dataGridFilters.js', 'js/home.js')); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main" class="home">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?> style="padding-top: 10px;">

            <table>
                <tr>
                    <td align="left" valign="top" style="text-align: left; height:50px;">
                        <div class="noteUnsizedSpan">My Recent Calls</div>
                        <?php $this->dataGrid2->drawHTML();  ?>
                    </td>

                    <td align="center" valign="top" style="text-align: left; font-size:11px; height:50px;">
                        <?php echo($this->upcomingEventsFupHTML); ?>
                    </td>

                    <td align="center" valign="top" style="text-align: left;font-size:11px; height:50px;">
                        <?php echo($this->upcomingEventsHTML); ?>
                    </td>
                </tr>
            </table>

            <table>
                <tr>
                    <td align="left" valign="top" style="text-align: left; width: 50%; height: 240px;">
                        <div class="noteUnsizedSpan">Recent Hires</div>

                        <table class="sortable" style="margin: 0 0 4px 0;">
                            <tr>
                                <th align="left" style="font-size:11px;">Name</th>
                                <th align="left" style="font-size:11px;">Company</th>
                                <th align="left" style="font-size:11px;">Recruiter</th>
                                <th align="left" style="font-size:11px;">Date</th>
                            </tr>
                            <?php foreach($this->hiredRS as $index => $data): ?>
                            <tr class="<?php TemplateUtility::printAlternatingRowClass($index); ?>">
                                <td style="font-size:11px;"><a href="<?php echo(CATSUtility::getIndexName()); ?>?m=candidates&amp;a=show&amp;candidateID=<?php echo($data['candidateID']); ?>"style="font-size:11px;" class="<?php echo($data['candidateClassName']); ?>"><?php $this->_($data['firstName']); ?> <?php $this->_($data['lastName']); ?></a></td>
                                <td style="font-size:11px;"><a href="<?php echo(CATSUtility::getIndexName()); ?>?m=companies&amp;a=show&amp;companyID=<?php echo($data['companyID']); ?>"  style="font-size:11px;" class="<?php echo($data['companyClassName']); ?>"><?php $this->_($data['companyName']); ?></td>
                                <td style="font-size:11px;"><?php $this->_(StringUtility::makeInitialName($data['userFirstName'], $data['userLastName'], false, LAST_NAME_MAXLEN)); ?></td>
                                <td style="font-size:11px;"><?php $this->_($data['date']); ?></td>
                            </tr>
                            <?php endforeach; ?>
                        </table>

                        <?php if (!count($this->hiredRS)): ?>
                            <div style="height: 207px; border: 1px solid #c0c0c0; background: #E7EEFF url(images/nodata/dashboardNoHiresWhite.jpg);">
                                &nbsp;
                            </div>
                        <?php endif; ?>
                    </td>

                    <td align="center" valign="top" style="text-align: left; width: 50%; height: 240px;">
                        <div class="noteUnsizedSpan">Hiring Overview</div>
                        <map name="dashboardmap" id="dashboardmap">
                           <area href="#" alt="Weekly" title="Weekly"
                                 shape="rect" coords="398,0,461,24" onclick="swapHomeGraph(<?php echo(DASHBOARD_GRAPH_WEEKLY); ?>);" />
                           <area href="#" alt="Monthly" title="Monthly"
                                 shape="rect" coords="398,25,461,48" onclick="swapHomeGraph(<?php echo(DASHBOARD_GRAPH_MONTHLY); ?>);" />
                            <area href="#" alt="Yearly" title="Yearly"
                                 shape="rect" coords="398,49,461,74" onclick="swapHomeGraph(<?php echo(DASHBOARD_GRAPH_YEARLY); ?>);" />
                        </map>
                        <img src="<?php echo(CATSUtility::getIndexName()); ?>?m=graphs&amp;a=miniHireStatistics&amp;width=495&amp;height=230" id="homeGraph" onclick="" alt="Hiring Overview" usemap="#dashboardmap" border="0" />
                    </td>
                </tr>
            </table>

            <table>
                <tr>
                    <td align="left" valign="top" style="text-align: left; width: 50%; height: 260px;">
                        <div class="noteUnsizedSpan">Important Candidates (Proposed to Customer through Offer Accepted in Active Job Orders) - Page <?php echo($this->dataGrid->getCurrentPageHTML()); ?> (<?php echo($this->dataGrid->getNumberOfRows()); ?> Items)</div>
                        <?php $this->dataGrid->draw(); ?>
                        <div style="float:right;"><?php $this->dataGrid->printNavigation(false); ?>&nbsp;&nbsp;&nbsp;&nbsp;<?php $this->dataGrid->printShowAll(); ?>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>

                        <?php if (!$this->dataGrid->getNumberOfRows()): ?>
                        <div style="height: 208px; border: 1px solid #c0c0c0; background: #E7EEFF url(images/nodata/dashboardNoCandidatesWhite.jpg);">
                            &nbsp;
                        </div>
                        <?php endif; ?>
                    </td>
                </tr>
            </table>

            <table>
                <tr>
                    <td align="left" valign="top" style="text-align: left; width: 50%; height: 260px;">
                        <div class="noteUnsizedSpan">Status Funnel Snapshot</div>
                        <div style="margin:4px 0; font-size:10px;">
                            <label for="funnelJobOrder">Job Order:</label>
                            <select id="funnelJobOrder" onchange="swapFunnelGraph(funnelCurrentView);" style="font-size:10px;">
                                <option value="">All Job Orders</option>
                                <?php foreach($this->jobOrderOptions as $option): ?>
                                    <option value="<?php $this->_($option['id']); ?>"><?php $this->_($option['title']); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div style="float:right; width:70px; margin-top:4px;">
                            <div style="padding:4px; border:1px solid #c0c0c0; margin-bottom:2px; cursor:pointer; font-size:10px; background:#f5f5f5;" onclick="swapFunnelGraph(0);">All-Time</div>
                            <div style="padding:4px; border:1px solid #c0c0c0; margin-bottom:2px; cursor:pointer; font-size:10px; background:#f5f5f5;" onclick="swapFunnelGraph(1);">Last Week</div>
                            <div style="padding:4px; border:1px solid #c0c0c0; cursor:pointer; font-size:10px; background:#f5f5f5;" onclick="swapFunnelGraph(2);">Last Month</div>
                        </div>
                        <img src="<?php echo(CATSUtility::getIndexName()); ?>?m=graphs&amp;a=pipelineFunnelSnapshot&amp;width=495&amp;height=230" id="funnelGraph" onclick="" alt="Status Funnel Snapshot" border="0" />
                    </td>
                </tr>
            </table>

            <table>
                <tr>
                    <td align="left" valign="top" style="text-align: left; width: 50%; height: 260px;">
                        <div class="noteUnsizedSpan">Seniority Distribution</div>
                        <div style="margin:4px 0; font-size:10px;">
                            <label><input type="checkbox" id="seniorityIncludeInactive" onclick="swapSeniorityGraph();" /> Include inactive</label>
                        </div>
                        <img src="<?php echo(CATSUtility::getIndexName()); ?>?m=graphs&amp;a=seniorityDistribution&amp;width=495&amp;height=230" id="seniorityGraph" onclick="" alt="Seniority Distribution" border="0" />
                    </td>
                </tr>
            </table>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

