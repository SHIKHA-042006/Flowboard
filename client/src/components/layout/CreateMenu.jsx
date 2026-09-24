import { useState } from 'react';
import { Plus, SquareKanban, Users } from 'lucide-react';
import Dropdown, { MenuItem } from '../ui/Dropdown.jsx';
import Button from '../ui/Button.jsx';
import CreateBoardModal from '../board/CreateBoardModal.jsx';
import CreateWorkspaceModal from './CreateWorkspaceModal.jsx';

/** The navbar "Create" button: a quick-pick menu for the two most common actions. */
export default function CreateMenu({ workspaces = [], onChanged }) {
  const [creatingBoard, setCreatingBoard] = useState(false);
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  return (
    <>
      <Dropdown
        width="w-52"
        trigger={({ toggle }) => (
          <Button size="sm" onClick={toggle}>
            <Plus size={16} /> Create
          </Button>
        )}
      >
        {({ close }) => (
          <>
            <MenuItem icon={SquareKanban} onClick={() => { close(); setCreatingBoard(true); }}>New board</MenuItem>
            <MenuItem icon={Users} onClick={() => { close(); setCreatingWorkspace(true); }}>New workspace</MenuItem>
          </>
        )}
      </Dropdown>

      <CreateBoardModal open={creatingBoard} onClose={() => setCreatingBoard(false)} workspaces={workspaces} onCreated={onChanged} />
      <CreateWorkspaceModal open={creatingWorkspace} onClose={() => setCreatingWorkspace(false)} onCreated={onChanged} />
    </>
  );
}
