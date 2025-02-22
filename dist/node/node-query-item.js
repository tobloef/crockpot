import { Node } from "./node.js";
export class NodeQueryItem {
    #brand = "NodeQueryItem";
    class;
    constructor(params) {
        this.class = params.class;
    }
}
export class RelatedNodeQueryItem extends NodeQueryItem {
    #brand = "RelatedNodeQueryItem";
    withItems;
    toItems;
    fromItems;
    fromOrToItems;
    constructor(params) {
        super(params);
        this.withItems = params.withItems;
        this.toItems = params.toItems;
        this.fromItems = params.fromItems;
        this.fromOrToItems = params.fromOrToItems;
    }
    as(name) {
        return new NamedRelatedNodeQueryItem({
            class: this.class,
            name,
            toItems: this.toItems,
            withItems: this.withItems,
            fromItems: this.fromItems,
            fromOrToItems: this.fromOrToItems,
        });
    }
}
export class NamedNodeQueryItem extends NodeQueryItem {
    #brand = "NamedNodeQueryItem";
    name;
    constructor(params) {
        super(params);
        this.name = params.name;
    }
    with(...items) {
        return new NamedRelatedNodeQueryItem({
            class: this.class,
            name: this.name,
            withItems: items,
        });
    }
    to(...items) {
        return new NamedRelatedNodeQueryItem({
            class: this.class,
            name: this.name,
            toItems: items,
        });
    }
    from(...items) {
        return new NamedRelatedNodeQueryItem({
            class: this.class,
            name: this.name,
            fromItems: items,
        });
    }
    fromOrTo(...items) {
        return new NamedRelatedNodeQueryItem({
            class: this.class,
            name: this.name,
            fromOrToItems: items,
        });
    }
}
export class NamedRelatedNodeQueryItem extends NodeQueryItem {
    #brand = "NamedRelatedNodeQueryItem";
    name;
    withItems;
    toItems;
    fromItems;
    fromOrToItems;
    constructor(params) {
        super(params);
        this.name = params.name;
        this.withItems = params.withItems;
        this.toItems = params.toItems;
        this.fromItems = params.fromItems;
        this.fromOrToItems = params.fromOrToItems;
    }
}
//# sourceMappingURL=node-query-item.js.map