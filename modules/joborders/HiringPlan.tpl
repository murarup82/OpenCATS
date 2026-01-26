<?php /* $Id: HiringPlan.tpl 1 2026-01-13 $ */ ?>
<?php TemplateUtility::printHeader('Job Orders'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents">
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/joborder.gif" width="24" height="24" border="0" alt="Job Orders" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>Job Orders: Hiring Plan</h2></td>
               </tr>
            </table>

            <p class="noteUnsizedSpan">Job Order: <?php echo(htmlspecialchars($this->jobOrderTitle)); ?></p>

            <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=editHiringPlan" method="post">
                <input type="hidden" name="jobOrderID" value="<?php echo((int) $this->jobOrderID); ?>" />
                <table class="editTable" width="100%">
                    <tr>
                        <td class="tdVertical">Start Date (MM-DD-YY)</td>
                        <td class="tdVertical">End Date (MM-DD-YY)</td>
                        <td class="tdVertical">Openings</td>
                        <td class="tdVertical">Priority</td>
                        <td class="tdVertical">Notes</td>
                        <td class="tdVertical">Remove</td>
                    </tr>

                    <?php foreach ($this->hiringPlanRS as $planRow): ?>
                        <tr>
                            <td class="tdData">
                                <input type="hidden" name="planID[]" value="<?php echo((int) $planRow['planID']); ?>" />
                                <input type="text" class="inputbox" name="startDate[]" value="<?php echo(htmlspecialchars($planRow['startDate'])); ?>" style="width: 110px;" />
                            </td>
                            <td class="tdData">
                                <input type="text" class="inputbox" name="endDate[]" value="<?php echo(htmlspecialchars($planRow['endDate'])); ?>" style="width: 110px;" />
                            </td>
                            <td class="tdData">
                                <input type="text" class="inputbox" name="openings[]" value="<?php echo((int) $planRow['openings']); ?>" style="width: 60px;" />
                            </td>
                            <td class="tdData">
                                <select class="inputbox" name="priority[]" style="width: 60px;">
                                    <?php for ($p = 1; $p <= 5; $p++): ?>
                                        <option value="<?php echo($p); ?>"<?php if ((int) $planRow['priority'] === $p): ?> selected<?php endif; ?>><?php echo($p); ?></option>
                                    <?php endfor; ?>
                                </select>
                            </td>
                            <td class="tdData">
                                <input type="text" class="inputbox" name="notes[]" value="<?php echo(htmlspecialchars($planRow['notes'])); ?>" style="width: 240px;" />
                            </td>
                            <td class="tdData">
                                <input type="checkbox" name="delete[]" value="<?php echo((int) $planRow['planID']); ?>" />
                            </td>
                        </tr>
                    <?php endforeach; ?>

                    <?php for ($i = 0; $i < 3; $i++): ?>
                        <tr>
                            <td class="tdData">
                                <input type="hidden" name="planID[]" value="0" />
                                <input type="text" class="inputbox" name="startDate[]" value="" style="width: 110px;" />
                            </td>
                            <td class="tdData">
                                <input type="text" class="inputbox" name="endDate[]" value="" style="width: 110px;" />
                            </td>
                            <td class="tdData">
                                <input type="text" class="inputbox" name="openings[]" value="" style="width: 60px;" />
                            </td>
                            <td class="tdData">
                                <select class="inputbox" name="priority[]" style="width: 60px;">
                                    <?php for ($p = 1; $p <= 5; $p++): ?>
                                        <option value="<?php echo($p); ?>"<?php if ($p === 1): ?> selected<?php endif; ?>><?php echo($p); ?></option>
                                    <?php endfor; ?>
                                </select>
                            </td>
                            <td class="tdData">
                                <input type="text" class="inputbox" name="notes[]" value="" style="width: 240px;" />
                            </td>
                            <td class="tdData"></td>
                        </tr>
                    <?php endfor; ?>
                </table>

                <p class="noteUnsizedSpan">Openings are auto-synced to the job order total. If no plan rows are saved, total openings will be 0.</p>

                <input type="submit" class="button" value="Save Hiring Plan" />
                &nbsp;
                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $this->jobOrderID); ?>">Cancel</a>
            </form>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
