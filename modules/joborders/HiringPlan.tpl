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

            <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=editHiringPlan" method="post" onsubmit="syncHiringPlanDates();">
                <input type="hidden" name="jobOrderID" value="<?php echo((int) $this->jobOrderID); ?>" />
                <input type="hidden" name="postback" value="postback" />
                <table class="editTable" width="100%">
                    <tr>
                        <td class="tdVertical">Start Date</td>
                        <td class="tdVertical">End Date</td>
                        <td class="tdVertical">Openings</td>
                        <td class="tdVertical">Priority</td>
                        <td class="tdVertical">Notes</td>
                        <td class="tdVertical">Remove</td>
                    </tr>

                    <?php $rowIndex = 0; ?>
                    <?php foreach ($this->hiringPlanRS as $planRow): ?>
                        <tr>
                            <td class="tdData">
                                <input type="hidden" name="planID[]" value="<?php echo((int) $planRow['planID']); ?>" />
                                <input type="hidden" name="startDate[]" id="startDateValue<?php echo($rowIndex); ?>" value="<?php echo(htmlspecialchars($planRow['startDate'])); ?>" />
                                <span id="startDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('startDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('startDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', '<?php echo(addslashes($planRow['startDate'])); ?>', -1);
                                </script>
                            </td>
                            <td class="tdData">
                                <input type="hidden" name="endDate[]" id="endDateValue<?php echo($rowIndex); ?>" value="<?php echo(htmlspecialchars($planRow['endDate'])); ?>" />
                                <span id="endDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('endDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('endDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', '<?php echo(addslashes($planRow['endDate'])); ?>', -1);
                                </script>
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
                        <?php $rowIndex++; ?>
                    <?php endforeach; ?>

                    <?php for ($i = 0; $i < 3; $i++): ?>
                        <tr>
                            <td class="tdData">
                                <input type="hidden" name="planID[]" value="0" />
                                <input type="hidden" name="startDate[]" id="startDateValue<?php echo($rowIndex); ?>" value="" />
                                <span id="startDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('startDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('startDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', '', -1);
                                </script>
                            </td>
                            <td class="tdData">
                                <input type="hidden" name="endDate[]" id="endDateValue<?php echo($rowIndex); ?>" value="" />
                                <span id="endDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('endDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('endDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', '', -1);
                                </script>
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
                        <?php $rowIndex++; ?>
                    <?php endfor; ?>
                </table>

                <input type="hidden" id="hiringPlanRowCount" value="<?php echo((int) $rowIndex); ?>" />

                <p class="noteUnsizedSpan">Openings are auto-synced to the job order total. If no plan rows are saved, total openings will be 0.</p>

                <input type="submit" class="button" value="Save Hiring Plan" />
                &nbsp;
                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $this->jobOrderID); ?>">Cancel</a>
            </form>
            <script type="text/javascript">
                function syncHiringPlanDates()
                {
                    var count = parseInt(document.getElementById('hiringPlanRowCount').value, 10);
                    if (isNaN(count))
                    {
                        return;
                    }

                    for (var i = 0; i < count; i++)
                    {
                        var startInput = document.getElementById('startDateInput' + i);
                        var startValue = document.getElementById('startDateValue' + i);
                        if (startInput && startValue)
                        {
                            startValue.value = startInput.value;
                        }

                        var endInput = document.getElementById('endDateInput' + i);
                        var endValue = document.getElementById('endDateValue' + i);
                        if (endInput && endValue)
                        {
                            endValue.value = endInput.value;
                        }
                    }
                }
            </script>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
