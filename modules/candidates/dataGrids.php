<?php

//TODO: License

include_once(LEGACY_ROOT . '/lib/Candidates.php');
include_once(LEGACY_ROOT . '/lib/Width.php');
include_once(LEGACY_ROOT . '/lib/SavedLists.php');

class candidatesListByViewDataGrid extends CandidatesDataGrid
{
    public function __construct($siteID, $parameters, $misc)
    {
        /* Pager configuration. */
        $this->_tableWidth = new Width(100, '%');
        $this->_defaultAlphabeticalSortBy = 'lastName';
        $this->ajaxMode = false;
        $this->showExportCheckboxes = true; //BOXES WILL NOT APPEAR UNLESS SQL ROW exportID IS RETURNED!
        $this->showActionArea = true;
        $this->showChooseColumnsBox = true;
        $this->allowResizing = true;

        $this->defaultSortBy = 'dateModifiedSort';
        $this->defaultSortDirection = 'DESC';

        $this->_defaultColumns = array(
            array('name' => 'Attachments', 'width' => 31),
            array('name' => 'First Name', 'width' => 75),
            array('name' => 'Last Name', 'width' => 85),
            array('name' => 'City', 'width' => 75),
            array('name' => 'Country', 'width' => 50),
            array('name' => 'Key Skills', 'width' => 215),
            array('name' => 'Comments', 'width' => 60),
            array('name' => 'Owner', 'width' => 65),
            array('name' => 'Created', 'width' => 60),
            array('name' => 'Source', 'width' => 140),
        );

         parent::__construct("candidates:candidatesListByViewDataGrid",
                             $siteID, $parameters, $misc
                        );
    }


    /**
     * Adds more options to the action area on the pager.  Overloads
     * DataGrid Inner Action Area function.
     *
     * @return html innerActionArea commands.
     */
    public function getInnerActionArea()
    {
        //TODO: Add items:
        //  - Add to List
        //  - Add to Job Order
        //  - Mass set rank (depends on each candidate having their own personal rank - are we going to do this?)
        $html = '';

        if ($_SESSION['CATS']->getAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT)
        {
            $html .= $this->getInnerActionAreaItemPopup('Add To List', CATSUtility::getIndexName().'?m=lists&amp;a=addToListFromDatagridModal&amp;dataItemType='.DATA_ITEM_CANDIDATE, 450, 350);
        }
        
        if($_SESSION['CATS']->getAccessLevel('pipelines.addToPipeline') >= ACCESS_LEVEL_EDIT) 
        {
            $html .= $this->getInnerActionAreaItemPopup('Add To Job Order', CATSUtility::getIndexName().'?m=candidates&amp;a=considerForJobSearch', 750, 460);
        }
        
        if(MAIL_MAILER != 0 && $_SESSION['CATS']->getAccessLevel('candidates.emailCandidates') >= ACCESS_LEVEL_SA)
        {
            $html .= $this->getInnerActionAreaItem('Send E-Mail', CATSUtility::getIndexName().'?m=candidates&amp;a=emailCandidates');
        }
        $html .= $this->getInnerActionAreaItem('Export', CATSUtility::getIndexName().'?m=export&amp;a=exportByDataGrid');

        $html .= parent::getInnerActionArea();

        return $html;
    }
}

class candidatesSavedListByViewDataGrid extends CandidatesDataGrid
{
    public function __construct($siteID, $parameters, $misc)
    {
        $this->_tableWidth = new Width(100, '%');
        $this->_defaultAlphabeticalSortBy = 'lastName';
        $this->ajaxMode = false;
        $this->showExportCheckboxes = true; //BOXES WILL NOT APPEAR UNLESS SQL ROW exportID IS RETURNED!
        $this->showActionArea = true;
        $this->showChooseColumnsBox = true;
        $this->allowResizing = true;

        $this->defaultSortBy = 'dateModifiedSort';
        $this->defaultSortDirection = 'DESC';

        $this->_defaultColumns = array(
            array('name' => 'Attachments', 'width' => 31),
            array('name' => 'First Name', 'width' => 75),
            array('name' => 'Last Name', 'width' => 85),
            array('name' => 'City', 'width' => 75),
            array('name' => 'Country', 'width' => 50),
            array('name' => 'Key Skills', 'width' => 200),
            array('name' => 'Comments', 'width' => 60),
            array('name' => 'Owner', 'width' => 65),
            array('name' => 'Modified', 'width' => 60),
            array('name' => 'Added To List', 'width' => 75),
        );

         parent::__construct("candidates:candidatesSavedListByViewDataGrid",
                             $siteID, $parameters, $misc
                        );
    }

    /**
     * Adds more options to the action area on the pager.  Overloads
     * DataGrid Inner Action Area function.
     *
     * @return html innerActionArea commands.
     */
    public function getInnerActionArea()
    {
        //TODO: Add items:
        //  - Add to List
        //  - Add to Job Order
        //  - Mass set rank (depends on each candidate having their own personal rank - are we going to do this?)
        $html = '';

        $canEditSavedList = false;
        if ($_SESSION['CATS']->getAccessLevel('lists.listByView') >= ACCESS_LEVEL_EDIT)
        {
            $savedLists = new SavedLists($_SESSION['CATS']->getSiteID());
            $canEditSavedList = $savedLists->canUserEditList(
                (int) $this->getMiscArgument(),
                (int) $_SESSION['CATS']->getUserID()
            );
        }

        if ($canEditSavedList)
        {
            $html .= $this->getInnerActionAreaItem('Remove From This List', CATSUtility::getIndexName().'?m=lists&amp;a=removeFromListDatagrid&amp;dataItemType='.DATA_ITEM_CANDIDATE.'&amp;savedListID='.$this->getMiscArgument(), false);
        }
        $html .= $this->getInnerActionAreaItemPopup('Add To Job Order', CATSUtility::getIndexName().'?m=candidates&amp;a=considerForJobSearch', 750, 460);
        if(MAIL_MAILER != 0 && $_SESSION['CATS']->getAccessLevel('candidates.emailCandidates') >= ACCESS_LEVEL_SA)
        {
            $html .= $this->getInnerActionAreaItem('Send E-Mail', CATSUtility::getIndexName().'?m=candidates&amp;a=emailCandidates');
        }
        $html .= $this->getInnerActionAreaItem('Export', CATSUtility::getIndexName().'?m=export&amp;a=exportByDataGrid');

        $html .= parent::getInnerActionArea();

        return $html;
    }
}


?>
