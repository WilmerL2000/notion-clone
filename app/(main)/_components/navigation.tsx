'use client';

import {
  ChevronsLeft,
  MenuIcon,
  Plus,
  PlusCircle,
  Search,
  Settings,
  Trash,
} from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ElementRef, useEffect, useRef, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { api } from '@/convex/_generated/api';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import UserItem from './user-item';

export default function Navigation() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const isResizingRef = useRef(false);
  const sidebarRef = useRef<ElementRef<'aside'>>(null);
  const navbarRef = useRef<ElementRef<'div'>>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  useEffect(() => {
    if (isMobile) {
      collapse();
    } else {
      resetWidth();
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      collapse();
    }
  }, [pathname, isMobile]);

  /**
   * The function `handleMouseDown` is a callback function that is triggered when a mouse button is
   * pressed down on a specific HTML div element, and it prevents the default behavior of the event,
   * stops the event from propagating further, sets a flag to indicate that resizing is in progress, and
   * adds event listeners for mouse move and mouse up events.
   * @param event - The event parameter is of type React.MouseEvent<HTMLDivElement, MouseEvent>. It
   * represents the mouse event that occurred.
   */
  const handleMouseDown = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    isResizingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  /**
   * The handleMouseMove function updates the width of the sidebar and navbar elements based on the
   * client's mouse movement, with constraints on the minimum and maximum width values.
   * @param {MouseEvent} event - The event parameter is of type MouseEvent, which represents a mouse
   * event. It contains information about the mouse movement, such as the current position of the mouse
   * cursor.
   * @returns If the `isResizingRef.current` is false, nothing is being returned. If
   * `isResizingRef.current` is true, the function updates the width of the `sidebarRef.current` and the
   * `navbarRef.current` elements and returns undefined.
   */
  const handleMouseMove = (event: MouseEvent) => {
    if (!isResizingRef.current) return;
    let newWidth = event.clientX;

    if (newWidth < 240) newWidth = 240;
    if (newWidth > 480) newWidth = 480;

    if (sidebarRef.current && navbarRef.current) {
      sidebarRef.current.style.width = `${newWidth}px`;
      navbarRef.current.style.setProperty('left', `${newWidth}px`);
      navbarRef.current.style.setProperty(
        'width',
        `calc(100% - ${newWidth}px)`
      );
    }
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  /**
   * The function `resetWidth` adjusts the width of the sidebar and navbar elements based on the value of
   * the `isMobile` variable.
   */
  const resetWidth = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(false);
      setIsResetting(true);

      sidebarRef.current.style.width = isMobile ? '100%' : '240px';
      navbarRef.current.style.setProperty(
        'width',
        isMobile ? '0' : 'calc(100% - 240px)'
      );
      navbarRef.current.style.setProperty('left', isMobile ? '100%' : '240px');
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  /**
   * The `collapse` function is used to collapse a sidebar and expand the navbar in a TypeScript React
   * application.
   */
  const collapse = () => {
    if (sidebarRef.current && navbarRef.current) {
      setIsCollapsed(true);
      setIsResetting(true);

      sidebarRef.current.style.width = '0';
      navbarRef.current.style.setProperty('width', '100%');
      navbarRef.current.style.setProperty('left', '0');
      setTimeout(() => setIsResetting(false), 300);
    }
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={cn(
          'group/sidebar h-full bg-secondary overflow-y-auto relative flex w-60 flex-col z-[99999]',
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'w-0'
        )}
      >
        <div
          onClick={collapse}
          role="button"
          className={cn(
            'h-6 w-6 text-muted-foreground rounded-sm hover:bg-neutral-300 dark:hover:bg-neutral-600 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 transition',
            isMobile && 'opacity-100'
          )}
        >
          <ChevronsLeft className="h-6 w-6" />
        </div>
        <div>
          <UserItem />
        </div>
        <div className="mt-4">
          <p>Action items</p>
        </div>
        <div
          onMouseDown={handleMouseDown}
          onClick={resetWidth}
          className="opacity-0 group-hover/sidebar:opacity-100 transition cursor-ew-resize 
        absolute h-full w-1 bg-primary/10 right-0 top-0"
        />
      </aside>
      <div
        ref={navbarRef}
        className={cn(
          'absolute top-0 z-[99999] left-60 w-[calc(100%-240px)]',
          isResetting && 'transition-all ease-in-out duration-300',
          isMobile && 'left-0 w-full'
        )}
      >
        <nav className="bg-transparent px-3 py-2 w-full">
          {isCollapsed && (
            <MenuIcon
              onClick={resetWidth}
              role="button"
              className="h-6 w-6 text-muted-foreground"
            />
          )}
        </nav>
      </div>
    </>
  );
}