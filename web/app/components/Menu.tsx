import React, { useRef } from 'react';
import { useMenu, useMenuItem, useMenuSection, useMenuTrigger, useSeparator } from 'react-aria';
import { TreeState, useMenuTriggerState, useTreeState } from 'react-stately';

import { Popover } from '@headlessui/react';
import { IconChevronDown } from '@tabler/icons';

import type { Node } from "@react-types/shared";
import type { AriaMenuProps, MenuTriggerProps } from "@react-types/menu";

interface MenuButtonProps<T extends object>
  extends AriaMenuProps<T>,
    MenuTriggerProps {
  label: string;
}

export function MenuButton<T extends object>(props: MenuButtonProps<T>) {
  // Create state based on the incoming props
  let state = useMenuTriggerState(props);

  // Get props for the menu trigger and menu elements
  let ref = React.useRef();
  let { menuTriggerProps, menuProps } = useMenuTrigger({}, state, ref);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button {...menuTriggerProps} isPressed={state.isOpen} ref={ref}>
        {props.label}
        <IconChevronDown className="ml-1 -mr-2 inline h-5 w-5" />
      </button>
      {state.isOpen && (
        <Popover isOpen onClose={state.close}>
          <Menu
            {...menuProps}
            {...props}
            autoFocus={state.focusStrategy || true}
            onClose={() => state.close()}
          />
        </Popover>
      )}
    </div>
  );
}

interface MenuProps<T extends object> extends AriaMenuProps<T> {
  onClose: () => void;
}

function Menu<T extends object>(props: MenuProps<T>) {
  // Create state based on the incoming props
  let state = useTreeState(props);

  // Get props for the menu element
  let ref = useRef();
  let { menuProps } = useMenu(props, state, ref);

  return (
    <ul
      {...menuProps}
      ref={ref}
      className="shadow-xs min-w-[200px] rounded-md pt-1 pb-1 focus:outline-none"
    >
      {[...state.collection].map((item) => (
        <MenuSection
          key={item.key}
          section={item}
          state={state}
          onAction={props.onAction}
          onClose={props.onClose}
        />
      ))}
    </ul>
  );
}

interface MenuSectionProps<T> {
  section: Node<T>;
  state: TreeState<T>;
  onAction: (key: React.Key) => void;
  onClose: () => void;
}

function MenuSection<T>({
  section,
  state,
  onAction,
  onClose,
}: MenuSectionProps<T>) {
  let { itemProps, groupProps } = useMenuSection({
    heading: section.rendered,
    "aria-label": section["aria-label"],
  });

  let { separatorProps } = useSeparator({
    elementType: "li",
  });

  return (
    <>
      {section.key !== state.collection.getFirstKey() && (
        <li
          {...separatorProps}
          className="mx-2 mt-1 mb-1 border-t border-gray-300"
        />
      )}
      <li {...itemProps}>
        <ul {...groupProps}>
          {[...section.childNodes].map((node) => (
            <MenuItem
              key={node.key}
              item={node}
              state={state}
              onAction={onAction}
              onClose={onClose}
            />
          ))}
        </ul>
      </li>
    </>
  );
}

interface MenuItemProps<T> {
  item: Node<T>;
  state: TreeState<T>;
  onAction: (key: React.Key) => void;
  onClose: () => void;
}

function MenuItem<T>({ item, state, onAction, onClose }: MenuItemProps<T>) {
  // Get props for the menu item element
  let ref = React.useRef();
  let { menuItemProps } = useMenuItem(
    {
      key: item.key,
      onAction,
      onClose,
    },
    state,
    ref
  );

  // Handle focus events so we can apply highlighted
  // style to the focused menu item
  let isFocused = state.selectionManager.focusedKey === item.key;
  let focusBg = item.key === "delete" ? "bg-red-500" : "bg-blue-500";
  let focus = isFocused ? `${focusBg} text-white` : "text-gray-900";

  return (
    <li
      {...menuItemProps}
      ref={ref}
      className={`${focus} relative mx-1 cursor-default select-none rounded py-2 pl-3 pr-9 text-sm focus:outline-none`}
    >
      {item.rendered}
    </li>
  );
}
