<?php /* $Id: Sourcing.tpl 1 2026-01-27 $ */ ?>
<?php TemplateUtility::printHeader('Sourcing'); ?>
<?php TemplateUtility::printHeaderBlock(); ?>
<?php TemplateUtility::printTabs($this->active); ?>
    <div id="main">
        <?php TemplateUtility::printQuickSearch(); ?>

        <div id="contents">
            <table>
                <tr>
                    <td width="3%">
                        <img src="images/reports.gif" width="24" height="24" border="0" alt="Sourcing" style="margin-top: 3px;" />&nbsp;
                    </td>
                    <td><h2>Sourcing</h2></td>
                </tr>
            </table>

            <p class="noteUnsizedSpan">Weekly HR sourced candidates (latest week first). Start at W01 2026 with default 0.</p>

            <style type="text/css">
                .sourcingTable { width: 100%; border-collapse: collapse; margin-top: 6px; }
                .sourcingTable th { background: #0b8fb3; color: #ffffff; padding: 6px 8px; border: 1px solid #0b8fb3; text-align: center; }
                .sourcingTable td { border: 1px solid #d0d0d0; padding: 6px 8px; text-align: center; }
                .sourcingTable td.sourcingWeek { text-align: left; }
                .sourcingCurrent { background: #f2f6fb; font-weight: bold; }
            </style>

            <form action="<?php echo(CATSUtility::getIndexName()); ?>?m=sourcing" method="post">
                <input type="hidden" name="postback" value="postback" />
                <table class="sourcingTable">
                    <thead>
                        <tr>
                            <th>Week</th>
                            <th>Year</th>
                            <th>HR Sourced</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($this->sourcingRows as $row): ?>
                            <tr<?php if (!empty($row['isCurrent'])): ?> class="sourcingCurrent"<?php endif; ?>>
                                <td class="sourcingWeek">
                                    <?php echo(htmlspecialchars($row['weekLabel'])); ?>
                                    <input type="hidden" name="weekNumber[]" value="<?php echo((int) $row['weekNumber']); ?>" />
                                </td>
                                <td>
                                    <?php echo((int) $row['weekYear']); ?>
                                    <input type="hidden" name="weekYear[]" value="<?php echo((int) $row['weekYear']); ?>" />
                                </td>
                                <td>
                                    <input type="text" class="inputbox" name="sourcedCount[]" value="<?php echo((int) $row['count']); ?>" style="width: 80px;" />
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>

                <input type="submit" class="button" value="Save" style="margin-top: 8px;" />
            </form>
        </div>
    </div>
<?php TemplateUtility::printFooter(); ?>
