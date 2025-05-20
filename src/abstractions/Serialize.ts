import type { ViewWrapper } from "@models"

export interface Serializer<T> {
    serialize: (view: ViewWrapper, data: T) => void
    deserialize: (view: ViewWrapper) => T
    parse: (json: any) => T
}