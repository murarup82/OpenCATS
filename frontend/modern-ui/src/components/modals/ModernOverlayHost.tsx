import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { QuickActionAddToListModernDataResponse, UIModeBootstrap } from '../../types';
import {
  callLegacyAjaxFunction,
  fetchAddToListDataFromPopupURL,
  fetchQuickActionAddToListData
} from '../../lib/api';
import { Modal } from '../../ui-core';

type Props = {
  bootstrap: UIModeBootstrap;
};

type AddToListEventDetail = {
  dataItemType?: number | string;
  dataItemID?: number | string;
  url?: string;
};

type AddToListContext = {
  sourceURL?: string;
  dataItemType?: number;
  dataItemID?: number;
};

type FeedbackConfig = {
  action: string;
  securityToken: string;
  returnQuery: string;
  pageURL: string;
};

type LegacyPopupMode = 'url' | 'html';

type LegacyPopupState = {
  mode: LegacyPopupMode;
  title: string;
  url: string;
  html: string;
  width: number;
  height: number;
  returnFunc: ((value?: unknown) => void) | null;
};

type LegacyPopupOpenDetail = {
  mode?: LegacyPopupMode;
  url?: string;
  html?: string;
  width?: number | string;
  height?: number | string;
  returnFunc?: unknown;
};

type LegacyPopupCloseDetail = {
  callReturnFunc?: boolean;
  refresh?: boolean;
};

type LegacyPopupTitleDetail = {
  title?: unknown;
};

type GlobalFeedbackWindow = Window & {
  CATSFeedback_openModal?: () => void;
  CATSFeedback_closeModal?: () => void;
};

function parsePositiveNumber(value: unknown): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return 0;
  }
  return Math.floor(parsed);
}

function parsePopupDimension(value: unknown, fallback: number, minValue: number, maxValue: number): number {
  const parsed = parsePositiveNumber(value);
  const nextValue = parsed <= 0 ? fallback : parsed;
  return Math.max(minValue, Math.min(nextValue, maxValue));
}

function toLegacyAjaxError(response: string): string {
  if (response === 'collision') {
    return 'That name is already in use. Please choose another.';
  }
  if (response === 'badName') {
    return 'Please enter a valid list name.';
  }
  return 'Operation failed. Please try again.';
}

export function ModernOverlayHost({ bootstrap }: Props) {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalLoading, setAddModalLoading] = useState(false);
  const [addModalBusy, setAddModalBusy] = useState(false);
  const [addModalError, setAddModalError] = useState('');
  const [addModalInfo, setAddModalInfo] = useState('');
  const [addContext, setAddContext] = useState<AddToListContext | null>(null);
  const [addData, setAddData] = useState<QuickActionAddToListModernDataResponse | null>(null);
  const [selectedListIDs, setSelectedListIDs] = useState<number[]>([]);
  const [newListName, setNewListName] = useState('');
  const [editingListID, setEditingListID] = useState<number | null>(null);
  const [editingListName, setEditingListName] = useState('');

  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackConfig, setFeedbackConfig] = useState<FeedbackConfig | null>(null);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackSubject, setFeedbackSubject] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [legacyPopup, setLegacyPopup] = useState<LegacyPopupState | null>(null);

  const legacyPopupRef = useRef<LegacyPopupState | null>(null);
  const legacyPopupFrameRef = useRef<HTMLIFrameElement | null>(null);

  const selectedCount = selectedListIDs.length;

  const loadAddToListData = useCallback(
    async (dataItemType: number, dataItemID: number) => {
      setAddModalLoading(true);
      setAddModalError('');
      setAddModalInfo('');
      setSelectedListIDs([]);
      setNewListName('');
      setEditingListID(null);
      setEditingListName('');

      try {
        const payload = await fetchQuickActionAddToListData(bootstrap, dataItemType, dataItemID);
        setAddData(payload);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to load list modal data.';
        setAddModalError(message);
      } finally {
        setAddModalLoading(false);
      }
    },
    [bootstrap]
  );

  const loadAddToListDataFromURL = useCallback(async (url: string) => {
    setAddModalLoading(true);
    setAddModalError('');
    setAddModalInfo('');
    setSelectedListIDs([]);
    setNewListName('');
    setEditingListID(null);
    setEditingListName('');

    try {
      const payload = await fetchAddToListDataFromPopupURL(bootstrap, url);
      setAddData(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load list modal data.';
      setAddModalError(message);
    } finally {
      setAddModalLoading(false);
    }
  }, [bootstrap]);

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false);
    setAddModalLoading(false);
    setAddModalBusy(false);
    setAddModalError('');
    setAddModalInfo('');
    setAddData(null);
    setAddContext(null);
    setSelectedListIDs([]);
    setNewListName('');
    setEditingListID(null);
    setEditingListName('');
  }, []);

  useEffect(() => {
    legacyPopupRef.current = legacyPopup;
  }, [legacyPopup]);

  const getLegacyPopupReturnValue = useCallback(() => {
    const frame = legacyPopupFrameRef.current;
    if (!frame) {
      return undefined;
    }

    try {
      const frameWindow = frame.contentWindow as (Window & { returnVal?: unknown }) | null;
      if (frameWindow && typeof frameWindow.returnVal !== 'undefined') {
        return frameWindow.returnVal;
      }
    } catch (error) {
      return undefined;
    }

    return undefined;
  }, []);

  const closeLegacyPopup = useCallback(
    (callReturnFunc: boolean, refresh: boolean) => {
      const current = legacyPopupRef.current;
      if (!current) {
        return;
      }

      setLegacyPopup(null);

      if (callReturnFunc && typeof current.returnFunc === 'function') {
        const returnValue = current.mode === 'url' ? getLegacyPopupReturnValue() : undefined;
        try {
          current.returnFunc(returnValue);
        } catch (error) {}
      }

      if (refresh) {
        window.location.reload();
      }
    },
    [getLegacyPopupReturnValue]
  );

  useEffect(() => {
    const handleAddToListOpen = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<AddToListEventDetail>;
      const sourceURL = String(event.detail?.url || '');
      if (sourceURL !== '') {
        event.preventDefault();
        setAddContext({ sourceURL });
        setAddModalOpen(true);
        void loadAddToListDataFromURL(sourceURL);
        return;
      }

      const nextDataItemType = parsePositiveNumber(event.detail?.dataItemType);
      const nextDataItemID = parsePositiveNumber(event.detail?.dataItemID);
      if (nextDataItemType <= 0 || nextDataItemID <= 0) {
        return;
      }

      event.preventDefault();
      setAddContext({
        dataItemType: nextDataItemType,
        dataItemID: nextDataItemID
      });
      setAddModalOpen(true);
      void loadAddToListData(nextDataItemType, nextDataItemID);
    };

    window.addEventListener('opencats:add-to-list:open', handleAddToListOpen as EventListener);
    return () => {
      window.removeEventListener('opencats:add-to-list:open', handleAddToListOpen as EventListener);
    };
  }, [loadAddToListData, loadAddToListDataFromURL]);

  useEffect(() => {
    const handleLegacyPopupOpen = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<LegacyPopupOpenDetail>;
      const detail = event.detail || {};
      const maxWidth = Math.max(340, window.innerWidth - 44);
      const maxHeight = Math.max(260, window.innerHeight - 120);

      event.preventDefault();
      setLegacyPopup({
        mode: detail.mode === 'html' ? 'html' : 'url',
        title: '',
        url: String(detail.url || 'js/submodal/loading.html'),
        html: String(detail.html || ''),
        width: parsePopupDimension(detail.width, 760, 340, maxWidth),
        height: parsePopupDimension(detail.height, 540, 260, maxHeight),
        returnFunc: typeof detail.returnFunc === 'function' ? detail.returnFunc : null
      });
    };

    const handleLegacyPopupClose = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<LegacyPopupCloseDetail>;
      if (!legacyPopupRef.current) {
        return;
      }

      event.preventDefault();
      closeLegacyPopup(event.detail?.callReturnFunc === true, event.detail?.refresh === true);
    };

    const handleLegacyPopupTitle = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<LegacyPopupTitleDetail>;
      if (!legacyPopupRef.current) {
        return;
      }

      event.preventDefault();
      const nextTitle = String(event.detail?.title || '');
      setLegacyPopup((current) => (current ? { ...current, title: nextTitle } : current));
    };

    window.addEventListener('opencats:legacy-popup:open', handleLegacyPopupOpen as EventListener);
    window.addEventListener('opencats:legacy-popup:close', handleLegacyPopupClose as EventListener);
    window.addEventListener('opencats:legacy-popup:title', handleLegacyPopupTitle as EventListener);
    return () => {
      window.removeEventListener('opencats:legacy-popup:open', handleLegacyPopupOpen as EventListener);
      window.removeEventListener('opencats:legacy-popup:close', handleLegacyPopupClose as EventListener);
      window.removeEventListener('opencats:legacy-popup:title', handleLegacyPopupTitle as EventListener);
    };
  }, [closeLegacyPopup]);

  useEffect(() => {
    const win = window as GlobalFeedbackWindow;
    const legacyModal = document.getElementById('globalFeedbackModal');
    const legacyBackdrop = document.getElementById('globalFeedbackBackdrop');
    const legacyForm = legacyModal ? legacyModal.querySelector('form') : null;

    if (legacyModal) {
      legacyModal.style.display = 'none';
    }
    if (legacyBackdrop) {
      legacyBackdrop.style.display = 'none';
    }

    if (legacyForm) {
      const action = legacyForm.getAttribute('action') || `${bootstrap.indexName}?m=home&a=submitFeedback`;
      const securityToken = (legacyForm.querySelector('input[name="securityToken"]') as HTMLInputElement | null)?.value || '';
      const returnQuery = (legacyForm.querySelector('input[name="returnQuery"]') as HTMLInputElement | null)?.value || '';
      const pageURL = (legacyForm.querySelector('input[name="pageURL"]') as HTMLInputElement | null)?.value || window.location.href;

      setFeedbackConfig({
        action,
        securityToken,
        returnQuery,
        pageURL
      });
    }

    const previousOpen = win.CATSFeedback_openModal;
    const previousClose = win.CATSFeedback_closeModal;

    win.CATSFeedback_openModal = () => {
      setFeedbackOpen(true);
    };
    win.CATSFeedback_closeModal = () => {
      setFeedbackOpen(false);
    };

    return () => {
      win.CATSFeedback_openModal = previousOpen;
      win.CATSFeedback_closeModal = previousClose;
    };
  }, [bootstrap.indexName]);

  const availableLists = addData?.lists || [];

  const canManageLists = !!addData?.permissions.canManageLists;
  const canDeleteLists = !!addData?.permissions.canDeleteLists;
  const addActionLabel = useMemo(() => {
    if (selectedCount <= 0) {
      return 'No list selected';
    }
    if (selectedCount === 1) {
      return '1 list selected';
    }
    return `${selectedCount} lists selected`;
  }, [selectedCount]);

  const toggleListSelection = (savedListID: number) => {
    if (addModalBusy) {
      return;
    }
    setSelectedListIDs((current) => {
      if (current.includes(savedListID)) {
        return current.filter((id) => id !== savedListID);
      }
      return [...current, savedListID];
    });
  };

  const runListMutation = async (mutation: () => Promise<void>) => {
    setAddModalBusy(true);
    setAddModalError('');
    setAddModalInfo('');
    try {
      await mutation();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Operation failed.';
      setAddModalError(message);
    } finally {
      setAddModalBusy(false);
    }
  };

  const handleCreateList = () => {
    const context = addContext;
    const data = addData;
    if (!context || !data) {
      return;
    }

    const description = newListName.trim();
    if (description === '') {
      setAddModalError('Please enter a valid list name.');
      return;
    }

    void runListMutation(async () => {
      const result = await callLegacyAjaxFunction(
        'lists:newList',
        {
          dataItemType: String(context.dataItemType),
          description
        },
        data.sessionCookie
      );
      if (result.response !== 'success') {
        throw new Error(toLegacyAjaxError(result.response));
      }

      setNewListName('');
      if (context.sourceURL) {
        await loadAddToListDataFromURL(context.sourceURL);
      } else if (context.dataItemType && context.dataItemID) {
        await loadAddToListData(context.dataItemType, context.dataItemID);
      }
      setAddModalInfo('List created successfully.');
    });
  };

  const handleRenameList = (savedListID: number) => {
    const data = addData;
    if (!data) {
      return;
    }

    const nextName = editingListName.trim();
    if (nextName === '') {
      setAddModalError('Please enter a valid list name.');
      return;
    }

    void runListMutation(async () => {
      const result = await callLegacyAjaxFunction(
        'lists:editListName',
        {
          savedListID: String(savedListID),
          savedListName: nextName
        },
        data.sessionCookie
      );
      if (result.response !== 'success') {
        throw new Error(toLegacyAjaxError(result.response));
      }

      setAddData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          lists: current.lists.map((list) =>
            list.savedListID === savedListID ? { ...list, description: nextName } : list
          )
        };
      });
      setEditingListID(null);
      setEditingListName('');
      setAddModalInfo('List renamed successfully.');
    });
  };

  const handleDeleteList = (savedListID: number, numberEntries: number) => {
    const data = addData;
    if (!data) {
      return;
    }

    if (numberEntries > 0 && !window.confirm(`Delete this list with ${numberEntries} entries?`)) {
      return;
    }

    void runListMutation(async () => {
      const result = await callLegacyAjaxFunction(
        'lists:deleteList',
        {
          savedListID: String(savedListID)
        },
        data.sessionCookie
      );
      if (result.response !== 'success') {
        throw new Error(toLegacyAjaxError(result.response));
      }

      setAddData((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          lists: current.lists.filter((list) => list.savedListID !== savedListID)
        };
      });
      setSelectedListIDs((current) => current.filter((id) => id !== savedListID));
      setAddModalInfo('List deleted successfully.');
    });
  };

  const handleAddToLists = () => {
    const data = addData;
    if (!data) {
      return;
    }

    if (selectedListIDs.length === 0) {
      setAddModalError('Select at least one list before adding.');
      return;
    }

    void runListMutation(async () => {
      const listsToAdd = `${selectedListIDs.join(',')},`;
      const itemsToAdd = data.dataItem.ids.join(',');
      const result = await callLegacyAjaxFunction(
        'lists:addToLists',
        {
          dataItemType: String(data.dataItem.type),
          listsToAdd,
          itemsToAdd
        },
        data.sessionCookie
      );
      if (result.response !== 'success') {
        throw new Error(toLegacyAjaxError(result.response));
      }

      setAddModalInfo('Items added to selected lists.');
      window.setTimeout(() => {
        closeAddModal();
        window.location.reload();
      }, 900);
    });
  };

  return (
    <>
      <Modal
        isOpen={addModalOpen}
        title="Add To Static Lists"
        onClose={closeAddModal}
        closeLabel="Close"
        size="lg"
        footer={
          <>
            <button type="button" className="modern-btn modern-btn--secondary" onClick={closeAddModal}>
              Close
            </button>
            {canManageLists ? (
              <button
                type="button"
                className="modern-btn modern-btn--secondary modern-btn--emphasis"
                onClick={handleAddToLists}
                disabled={selectedListIDs.length === 0 || addModalBusy || addModalLoading}
              >
                Add To Lists
              </button>
            ) : null}
          </>
        }
      >
        <div className="modern-overlay-list-modal">
          <p className="modern-overlay-list-modal__hint">
            {addData
              ? `Select the lists you want to add this ${addData.dataItem.typeLabel.toLowerCase()} to.`
              : 'Loading list data...'}
          </p>

          <div className="modern-overlay-list-modal__status">{addActionLabel}</div>

          {addModalError !== '' ? <div className="modern-overlay-list-modal__error">{addModalError}</div> : null}
          {addModalInfo !== '' ? <div className="modern-overlay-list-modal__info">{addModalInfo}</div> : null}

          {addModalLoading ? (
            <div className="modern-overlay-list-modal__empty">Loading lists...</div>
          ) : availableLists.length === 0 ? (
            <div className="modern-overlay-list-modal__empty">No lists available yet. Create one to continue.</div>
          ) : (
            <div className="modern-overlay-list-modal__list">
              {availableLists.map((list) => {
                const isSelected = selectedListIDs.includes(list.savedListID);
                const isEditing = editingListID === list.savedListID;
                return (
                  <div className="modern-overlay-list-modal__row" key={list.savedListID}>
                    <label className="modern-overlay-list-modal__row-main">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={addModalBusy}
                        onChange={() => toggleListSelection(list.savedListID)}
                      />
                      <span className="modern-overlay-list-modal__row-label">
                        {isEditing ? (
                          <input
                            className="modern-overlay-list-modal__name-input"
                            value={editingListName}
                            onChange={(event) => setEditingListName(event.target.value)}
                          />
                        ) : (
                          list.description
                        )}
                      </span>
                      <span className="modern-overlay-list-modal__row-count">({list.numberEntries})</span>
                    </label>

                    {canManageLists ? (
                      <div className="modern-overlay-list-modal__row-actions">
                        {isEditing ? (
                          <>
                            {canDeleteLists ? (
                              <button
                                type="button"
                                className="modern-btn modern-btn--ghost"
                                onClick={() => handleDeleteList(list.savedListID, list.numberEntries)}
                                disabled={addModalBusy}
                              >
                                Delete
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className="modern-btn modern-btn--ghost"
                              onClick={() => handleRenameList(list.savedListID)}
                              disabled={addModalBusy}
                            >
                              Save
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="modern-btn modern-btn--ghost"
                            onClick={() => {
                              setEditingListID(list.savedListID);
                              setEditingListName(list.description);
                            }}
                            disabled={addModalBusy}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {canManageLists ? (
            <div className="modern-overlay-list-modal__new-list">
              <input
                type="text"
                className="modern-overlay-list-modal__name-input"
                placeholder="New list name"
                value={newListName}
                onChange={(event) => setNewListName(event.target.value)}
                disabled={addModalBusy || addModalLoading}
              />
              <button
                type="button"
                className="modern-btn modern-btn--secondary"
                onClick={handleCreateList}
                disabled={addModalBusy || addModalLoading}
              >
                New List
              </button>
            </div>
          ) : null}
        </div>
      </Modal>

      <Modal
        isOpen={feedbackOpen}
        title="Submit Feedback"
        onClose={() => setFeedbackOpen(false)}
        closeLabel="Close"
        size="md"
        footer={
          <>
            <button type="button" className="modern-btn modern-btn--secondary" onClick={() => setFeedbackOpen(false)}>
              Cancel
            </button>
            <button type="submit" form="modernFeedbackForm" className="modern-btn modern-btn--secondary modern-btn--emphasis">
              Send Feedback
            </button>
          </>
        }
      >
        {feedbackConfig ? (
          <form id="modernFeedbackForm" method="post" action={feedbackConfig.action} className="modern-overlay-feedback-form">
            <input type="hidden" name="securityToken" value={feedbackConfig.securityToken} />
            <input type="hidden" name="returnQuery" value={feedbackConfig.returnQuery} />
            <input type="hidden" name="pageURL" value={feedbackConfig.pageURL} />

            <label className="modern-overlay-feedback-form__field">
              <span>Type</span>
              <select name="feedbackType" value={feedbackType} onChange={(event) => setFeedbackType(event.target.value)}>
                <option value="bug">Bug Report</option>
                <option value="feature">Feature Request</option>
                <option value="general">General Feedback</option>
              </select>
            </label>

            <label className="modern-overlay-feedback-form__field">
              <span>Subject (optional)</span>
              <input
                type="text"
                name="subject"
                maxLength={255}
                value={feedbackSubject}
                onChange={(event) => setFeedbackSubject(event.target.value)}
              />
            </label>

            <label className="modern-overlay-feedback-form__field">
              <span>Details</span>
              <textarea
                name="message"
                maxLength={4000}
                required
                value={feedbackMessage}
                onChange={(event) => setFeedbackMessage(event.target.value)}
              />
            </label>
          </form>
        ) : (
          <div className="modern-overlay-list-modal__empty">Feedback form is unavailable on this route.</div>
        )}
      </Modal>

      <Modal
        isOpen={legacyPopup !== null}
        title={legacyPopup?.title || 'Dialog'}
        onClose={() => closeLegacyPopup(false, false)}
        closeLabel="Close"
        size={
          legacyPopup
            ? legacyPopup.width <= 520
              ? 'sm'
              : legacyPopup.width <= 840
                ? 'md'
                : 'lg'
            : 'md'
        }
        footer={
          <button type="button" className="modern-btn modern-btn--secondary" onClick={() => closeLegacyPopup(false, false)}>
            Close
          </button>
        }
      >
        {legacyPopup ? (
          <div className="modern-overlay-legacy-popup" style={{ height: `${legacyPopup.height}px` }}>
            {legacyPopup.mode === 'html' ? (
              <div className="modern-overlay-legacy-popup__html" dangerouslySetInnerHTML={{ __html: legacyPopup.html }} />
            ) : (
              <iframe
                ref={legacyPopupFrameRef}
                className="modern-overlay-legacy-popup__iframe"
                src={legacyPopup.url}
                title={legacyPopup.title || 'Legacy popup'}
              />
            )}
          </div>
        ) : null}
      </Modal>
    </>
  );
}
