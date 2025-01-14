import { action, observable, makeObservable } from 'mobx';

import type { OpenAPIExternalDocumentation, OpenAPITag } from '../../types';
import { safeSlugify } from '../../utils';
import { MarkdownRenderer } from '../MarkdownRenderer';
import type { ContentItemModel, IMenuItem, MarkdownHeading, MenuItemGroupType } from '../types';

/**
 * Operations Group model ready to be used by components
 */
export class GroupModel implements IMenuItem {
  //#region IMenuItem fields
  id: string;
  absoluteIdx?: number;
  name: string;
  sidebarLabel: string;
  description?: string;
  type: MenuItemGroupType;

  items: ContentItemModel[] = [];
  parent?: GroupModel;
  externalDocs?: OpenAPIExternalDocumentation;

  @observable
  active: boolean = false;
  @observable
  expanded: boolean = false;

  depth: number;
  level: number;
  collapsibleGroups: boolean;
  //#endregion

  constructor(
    type: MenuItemGroupType,
    tagOrGroup: OpenAPITag | MarkdownHeading,
    parent?: GroupModel,
    collapsedGroup: boolean = false
  ) {
    makeObservable(this);

    // markdown headings already have ids calculated as they are needed for heading anchors
    this.id = (tagOrGroup as MarkdownHeading).id || type + '/' + safeSlugify(tagOrGroup.name);
    this.type = type;
    this.name = tagOrGroup['x-displayName'] || tagOrGroup.name;
    this.level = (tagOrGroup as MarkdownHeading).level || 1;
    this.collapsibleGroups = !collapsedGroup;

    this.sidebarLabel = this.name;

    // remove sections from markdown, same as in ApiInfo
    this.description = tagOrGroup.description || '';

    const items = (tagOrGroup as MarkdownHeading).items;
    if (items && items.length) {
      this.description = MarkdownRenderer.getTextBeforeHading(this.description, items[0].name);
    }

    this.parent = parent;
    this.externalDocs = (tagOrGroup as OpenAPITag).externalDocs;

    // groups are active (expanded) by default
    if (this.type === 'group') {
      this.expanded = collapsedGroup;
    }
  }

  @action
  activate() {
    this.active = true;
  }

  @action
  expand() {
    if (this.parent) {
      this.parent.expand();
    }
    this.expanded = true;
  }

  @action
  collapse() {
    // disallow collapsing groups
    if (this.type === 'group' && !this.collapsibleGroups) {
      return;
    }
    this.expanded = false;
  }

  @action
  deactivate() {
    this.active = false;
  }
}
