<?php /* $Id: HiringPlan.tpl 1 2026-01-13 $ */ ?>
<?php TemplateUtility::printHeader('Job Orders'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents"<?php echo TemplateUtility::getUI2WrapperAttribute(); ?>>
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

                    <tbody id="hiringPlanTableBody">
                    <?php $rowIndex = 0; ?>
                    <?php foreach ($this->hiringPlanRS as $planRow): ?>
                        <tr id="hiringPlanRow<?php echo($rowIndex); ?>">
                            <td class="tdData">
                                <input type="hidden" name="planID[]" value="<?php echo((int) $planRow['planID']); ?>" />
                                <span id="startDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('startDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('startDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', <?php echo(json_encode($planRow['startDate'])); ?>, -1);
                                    var startInput<?php echo($rowIndex); ?> = document.getElementById('startDateInput<?php echo($rowIndex); ?>');
                                    if (startInput<?php echo($rowIndex); ?>)
                                    {
                                        startInput<?php echo($rowIndex); ?>.name = 'startDate[]';
                                        startInput<?php echo($rowIndex); ?>.setAttribute('data-testid', 'hiring-start-date');
                                        startInput<?php echo($rowIndex); ?>.setAttribute('data-row', <?php echo((int) $rowIndex); ?>);
                                    }
                                </script>
                            </td>
                            <td class="tdData">
                                <span id="endDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('endDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('endDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', <?php echo(json_encode($planRow['endDate'])); ?>, -1);
                                    var endInput<?php echo($rowIndex); ?> = document.getElementById('endDateInput<?php echo($rowIndex); ?>');
                                    if (endInput<?php echo($rowIndex); ?>)
                                    {
                                        endInput<?php echo($rowIndex); ?>.name = 'endDate[]';
                                        endInput<?php echo($rowIndex); ?>.setAttribute('data-testid', 'hiring-end-date');
                                        endInput<?php echo($rowIndex); ?>.setAttribute('data-row', <?php echo((int) $rowIndex); ?>);
                                    }
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
                                <a href="#" onclick="return removeHiringPlanRow(<?php echo($rowIndex); ?>, <?php echo((int) $planRow['planID']); ?>);">Remove</a>
                            </td>
                        </tr>
                        <?php $rowIndex++; ?>
                    <?php endforeach; ?>

                    <?php if (empty($this->hiringPlanRS)): ?>
                        <tr id="hiringPlanRow<?php echo($rowIndex); ?>">
                            <td class="tdData">
                                <input type="hidden" name="planID[]" value="0" />
                                <span id="startDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('startDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('startDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', '', -1);
                                    var startInput<?php echo($rowIndex); ?> = document.getElementById('startDateInput<?php echo($rowIndex); ?>');
                                    if (startInput<?php echo($rowIndex); ?>)
                                    {
                                        startInput<?php echo($rowIndex); ?>.name = 'startDate[]';
                                        startInput<?php echo($rowIndex); ?>.setAttribute('data-testid', 'hiring-start-date');
                                        startInput<?php echo($rowIndex); ?>.setAttribute('data-row', <?php echo((int) $rowIndex); ?>);
                                    }
                                </script>
                            </td>
                            <td class="tdData">
                                <span id="endDatePicker<?php echo($rowIndex); ?>"></span>
                                <script type="text/javascript">
                                    document.getElementById('endDatePicker<?php echo($rowIndex); ?>').innerHTML =
                                        DateInputForDOM('endDateInput<?php echo($rowIndex); ?>', false, 'MM-DD-YY', '', -1);
                                    var endInput<?php echo($rowIndex); ?> = document.getElementById('endDateInput<?php echo($rowIndex); ?>');
                                    if (endInput<?php echo($rowIndex); ?>)
                                    {
                                        endInput<?php echo($rowIndex); ?>.name = 'endDate[]';
                                        endInput<?php echo($rowIndex); ?>.setAttribute('data-testid', 'hiring-end-date');
                                        endInput<?php echo($rowIndex); ?>.setAttribute('data-row', <?php echo((int) $rowIndex); ?>);
                                    }
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
                    <?php endif; ?>
                    </tbody>
                </table>

                <input type="hidden" id="hiringPlanRowCount" value="<?php echo((int) $rowIndex); ?>" />
                <div id="hiringPlanDeletedContainer"></div>

                <p class="noteUnsizedSpan">Openings are auto-synced to the job order total. If no plan rows are saved, total openings will be 0.</p>

                <input type="submit" class="button" value="Save Hiring Plan" />
                &nbsp;
                <input type="button" class="button" value="Add Row" onclick="addHiringPlanRow();" />
                &nbsp;
                <a href="<?php echo(CATSUtility::getIndexName()); ?>?m=joborders&amp;a=show&amp;jobOrderID=<?php echo((int) $this->jobOrderID); ?>">Cancel</a>
            </form>
            <script type="text/javascript">
                function addHiringPlanRow()
                {
                    var tableBody = document.getElementById('hiringPlanTableBody');
                    var rowCountInput = document.getElementById('hiringPlanRowCount');
                    var rowIndex = parseInt(rowCountInput.value, 10);
                    if (isNaN(rowIndex))
                    {
                        rowIndex = 0;
                    }

                    var row = document.createElement('tr');
                    row.id = 'hiringPlanRow' + rowIndex;
                    row.innerHTML =
                        '<td class="tdData">' +
                            '<input type="hidden" name="planID[]" value="0" />' +
                            '<span id="startDatePicker' + rowIndex + '"></span>' +
                        '</td>' +
                        '<td class="tdData">' +
                            '<span id="endDatePicker' + rowIndex + '"></span>' +
                        '</td>' +
                        '<td class="tdData">' +
                            '<input type="text" class="inputbox" name="openings[]" value="" style="width: 60px;" />' +
                        '</td>' +
                        '<td class="tdData">' +
                            '<select class="inputbox" name="priority[]" style="width: 60px;">' +
                                '<option value="1" selected>1</option>' +
                                '<option value="2">2</option>' +
                                '<option value="3">3</option>' +
                                '<option value="4">4</option>' +
                                '<option value="5">5</option>' +
                            '</select>' +
                        '</td>' +
                        '<td class="tdData">' +
                            '<input type="text" class="inputbox" name="notes[]" value="" style="width: 240px;" />' +
                        '</td>' +
                        '<td class="tdData">' +
                            '<a href="#" onclick="return removeHiringPlanRow(' + rowIndex + ', 0);">Remove</a>' +
                        '</td>';

                    tableBody.appendChild(row);

                    document.getElementById('startDatePicker' + rowIndex).innerHTML =
                        DateInputForDOM('startDateInput' + rowIndex, false, 'MM-DD-YY', '', -1);
                    document.getElementById('endDatePicker' + rowIndex).innerHTML =
                        DateInputForDOM('endDateInput' + rowIndex, false, 'MM-DD-YY', '', -1);
                    var startInput = document.getElementById('startDateInput' + rowIndex);
                    if (startInput)
                    {
                        startInput.name = 'startDate[]';
                        startInput.setAttribute('data-testid', 'hiring-start-date');
                        startInput.setAttribute('data-row', rowIndex);
                    }
                    var endInput = document.getElementById('endDateInput' + rowIndex);
                    if (endInput)
                    {
                        endInput.name = 'endDate[]';
                        endInput.setAttribute('data-testid', 'hiring-end-date');
                        endInput.setAttribute('data-row', rowIndex);
                    }

                    rowCountInput.value = rowIndex + 1;
                }

                function removeHiringPlanRow(rowIndex, planID)
                {
                    var row = document.getElementById('hiringPlanRow' + rowIndex);
                    if (row && row.parentNode)
                    {
                        row.parentNode.removeChild(row);
                    }

                    if (planID && planID > 0)
                    {
                        var container = document.getElementById('hiringPlanDeletedContainer');
                        var input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'delete[]';
                        input.value = planID;
                        container.appendChild(input);
                    }

                    return false;
                }

            </script>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>

