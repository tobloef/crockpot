import { Edge } from "./edge.js";
export class EdgeQueryItem {
    #brand = 'EdgeQueryItem';
    class;
    constructor(params) {
        this.class = params.class;
    }
}
export class NamedEdgeQueryItem extends EdgeQueryItem {
    #brand = 'NamedEdgeQueryItem';
    name;
    constructor(params) {
        super(params);
        this.name = params.name;
    }
    to(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            toItem: item,
        });
    }
    from(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            fromItem: item,
        });
    }
    fromOrTo(...items) {
        if (items.length > 2) {
            throw new Error(`The 'fromOrTo' parameter can only accept up to 2 items, but ${items.length} were given.`);
        }
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            fromOrToItems: items,
        });
    }
}
export class RelatedEdgeQueryItem extends EdgeQueryItem {
    #brand = 'RelatedEdgeQueryItem';
    toItem;
    fromItem;
    fromOrToItems;
    constructor(params) {
        super(params);
        this.toItem = params.toItem;
        this.fromItem = params.fromItem;
        this.fromOrToItems = params.fromOrToItems;
    }
    as(name) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name,
            toItem: this.toItem,
            fromItem: this.fromItem,
            fromOrToItems: this.fromOrToItems,
        });
    }
    to(item) {
        return new RelatedEdgeQueryItem({
            class: this.class,
            toItem: item,
        });
    }
    from(item) {
        return new RelatedEdgeQueryItem({
            class: this.class,
            fromItem: item,
        });
    }
}
export class NamedRelatedEdgeQueryItem extends EdgeQueryItem {
    #brand = 'NamedRelatedEdgeQueryItem';
    name;
    toItem;
    fromItem;
    fromOrToItems;
    constructor(params) {
        super(params);
        this.name = params.name;
        this.toItem = params.toItem;
        this.fromItem = params.fromItem;
        this.fromOrToItems = params.fromOrToItems;
    }
    to(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            toItem: item,
        });
    }
    from(item) {
        return new NamedRelatedEdgeQueryItem({
            class: this.class,
            name: this.name,
            fromItem: item,
        });
    }
}
//# sourceMappingURL=edge-query-item.js.map