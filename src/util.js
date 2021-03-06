import _fetch from 'isomorphic-fetch'
import * as React from 'react'

// Config default config to test with 
export const Config = {
    namespace: process.env.NAMESPACE,
    url: process.env.API_URL,
    registry: "https://docker.io",
    apikey: "testapikey",
    secret: "test-secret",
    secretdata: "test-secret-data"
}

export function SanitizePath(path) {
    if (path === "") {
        return path
    }

    if (path === "/") {
        return ""
    }

    if (path.startsWith("/")) {
        return path
    }

    return "/" + path
}

// CloseEventSource closes the event source when the component unmounts
export async function CloseEventSource(eventSource) {
    if (eventSource !== null) {
        eventSource.close()
    }
}

export function TrimPathSlashes(path) {
    path.replace(/^\//, "");
    path.replace(/\/^/, "");
    return path
}

// HandleError returns a helpful message back based on the response
export async function HandleError(summary, resp, perm) {
    const contentType = resp.headers.get('content-type')

    if (resp.status === 405) {
        return `${summary}: method is not allowed`
    }

    if (resp.status !== 403) {
        if (!contentType || !contentType.includes('application/json')) {
            let text = await resp.text()
            return `${summary}: ${text}`
        } else {
            if (resp.headers.get('grpc-message')) {
                return `${summary}: ${resp.headers.get('grpc-message')}`
            } else {
                let text = (await resp.json()).message
                return `${summary}: ${text}`
            }
        }
    } else {
        return `You do not have permission to '${summary}', contact system admin to grant '${perm}'`
    }
}

export function ExtractQueryString(appendMode, ...queryParameters) {
    if (queryParameters === undefined || queryParameters.length === 0) {
        return ""
    }

    let queryString = ""
    for (let i = 0; i < queryParameters.length; i++) {
        const query = queryParameters[i];
        if (i > 0 || appendMode) {
            queryString += "&" + query
        } else {
            queryString += query
        }
    }

    if (appendMode) {
        return queryString
    }

    return `?${queryString}`
}

export function QueryStringsContainsQuery(containQuery, ...queryParameters) {
    if (queryParameters === undefined || queryParameters.length === 0) {
        return false
    }

    for (let i = 0; i < queryParameters.length; i++) {
        const query = queryParameters[i];
        if (query.startsWith(`${containQuery}=`)) {
            return true
        }
    }

    return false
}

// PageInfoProcessor: Gives new pageInfo back and whether or not to update data
// PageInfo hasNextPage and hasPreviousPage can both potentially be unreliable
// hasNextPage becomes unreliable when taversing pages backwards ("before" query is used) 
// hasPreviousPage becomes unreliable when taversing pages forward ("after" query is used) 
// Due to this uncertainty, unreliable fields will be set to true by default.
// If no new data is received and there is old data, unreliable fields will be set to their real value returned
// by the server, and data should not be updated.
export function PageInfoProcessor(oldPageInfo, newPageInfo, oldData, newData, ...queryParameters) {
    // Best guess direction of pagination
    let goingBackward = QueryStringsContainsQuery("before", ...queryParameters)
    let atStartOrEndPage = newData.length === 0 && oldData != null && oldPageInfo != null
    let out = { pageInfo: {}, shouldUpdate: false }

    // atStartOrEndPage pageInfo should be adjusted, but data should not be updated
    if (atStartOrEndPage) {
        out.pageInfo = oldPageInfo

        out.pageInfo.hasNextPage = goingBackward ? !newPageInfo.hasPreviousPage : out.pageInfo.hasNextPage
        out.pageInfo.hasPreviousPage = !goingBackward ? !newPageInfo.hasNextPage : out.pageInfo.hasPreviousPage

        out.pageInfo.hasPreviousPage = goingBackward ? newPageInfo.hasPreviousPage : out.pageInfo.hasPreviousPage
        out.pageInfo.hasNextPage = !goingBackward ? newPageInfo.hasNextPage : out.pageInfo.hasNextPage

        return out
    }

    // Update pageinfo and data
    out.pageInfo = newPageInfo

    out.pageInfo.hasNextPage = goingBackward ? true : out.pageInfo.hasNextPage
    out.pageInfo.hasPreviousPage = !goingBackward ? true : out.pageInfo.hasPreviousPage

    out.shouldUpdate = true

    return out
}

export const STATE = {
    UPDATE: 'update',
    UPDATELIST: "updateList",
    PUSHITEM: "pushItem",
    APPENDLIST: "appendList",
    UPDATEKEY: "updateKey"
};

export const EVENTSTATE = {
    ADDED: 'ADDED',
    MODIFIED: "MODIFIED",
    DELETED: "DELETED",

    CLEAR: "CLEAR"
};

export function EventStateReducer(state, action) {

    // Clear state
    if (action.event === EVENTSTATE.CLEAR){
        return []
    }

    // Get unique id of new item
    const newItemID = getPropStr(action.data, action.idNewItemKey)
    if (!newItemID) {
        return state
    }

    // Check if unique id already exists and track its itemIndex if it does.
    let itemIndex = -1
    const newState = JSON.parse(JSON.stringify(state))
    for (let i = 0; i < newState.length; i++) {
        const stateItemID = getPropStr(newState[i], action.idKey)
        if (stateItemID === newItemID) {
            itemIndex = i
            break;
        }
    }

    switch (action.event) {
        case EVENTSTATE.MODIFIED:
            if (itemIndex >= 0) {
                if (action.idData) {
                    const newItem = getPropStr(action.data, action.idData)
                    newState[itemIndex] = {...newItem}
                } else {
                    newState[itemIndex] = {...action.data}
                }
            }
            break
        case EVENTSTATE.DELETED:
            if (itemIndex >= 0) {
                newState.splice(itemIndex, 1)
            }

            break
        case EVENTSTATE.ADDED:
        default:
            if (itemIndex === -1) {
                if (action.idData) {
                    const newItem = getPropStr(action.data, action.idData)
                    newState.push(newItem)
                } else {
                    newState.push(action.data)
                }
            }

    }

    return newState
}

const getPropStr = (object, pathStr) => {
    const path = pathStr.split(".")

    try {
        return getProp(object, path)
    } catch (err) {
        return null
    }
}

const getProp = (object, path) => {
    if (path.length === 1) return object[path[0]];
    else if (path.length === 0) throw error;
    else {
        if (object[path[0]]) return getProp(object[path[0]], path.slice(1));
        else {
            object[path[0]] = {};
            return getProp(object[path[0]], path.slice(1));
        }
    }
};

export function StateReducer(state, action) {
    let pushAppentListData = null
    switch (action.type) {
        case STATE.UPDATE:
            return action.data;
        case STATE.PUSHITEM:
            if (!pushAppentListData) {
                pushAppentListData = state ? state : []
                pushAppentListData.push(action.data)
            }
        // fallthrough to UPDATELIST
        case STATE.APPENDLIST:
            if (!pushAppentListData) {
                pushAppentListData = state ? JSON.parse(JSON.stringify(state)) : []
                if (action.edgeData) {
                    // append edgeData list to current state
                    for (let i = 0; i < action.edgeData.length; i++) {
                        pushAppentListData.push(action.edgeData[i])
                    }
                } else if (action.data) {
                    // append data list to current state
                    for (let i = 0; i < action.data.length; i++) {
                        pushAppentListData.push(action.data[i])
                    }
                }
            }

        // fallthrough to UPDATELIST
        case STATE.UPDATELIST:
            var pInfo
            if (action?.totalCount === 0) {
                // New list contents has no data so force an update
                // This prevents list not getting updated when deleting list item on list
                pInfo = {
                    shouldUpdate: true,
                    pageInfo: action.newPageInfo
                }
            } else {
                // Calculate pageinfo and whether to update list based on query params and new data
                const queryParams = action.queryString.replace(/^(\?)/, '').split("&")
                pInfo = PageInfoProcessor(action.oldPageInfo, action.newPageInfo, state, action.edgeData, ...queryParams)
            }

            action.setPageInfo(pInfo.pageInfo)
            if (pInfo.shouldUpdate) {
                if (pushAppentListData) {
                    // STATE.APPENDLIST or STATE.PUSHITEM was used
                    return pushAppentListData
                }
                else if (action.data) {
                    return action.data
                } else {
                    return action.edgeData
                }

            }

            return state
        case STATE.UPDATEKEY:
            if (state[action.key]) {
                state[action.key] = JSON.parse(JSON.stringify(action.data))
            }

            return state
        default:
            return state
    }
}

// Auto clean eventsource when changed or unmounted
export const useEventSourceCleaner = (eventSource, extra) => {
    const eventSourceRef = React.useRef(eventSource);

    // CLEANUP: close old eventsource and updates ref
    React.useEffect(() => {
        eventSourceRef.current = eventSource

        return () => {
            CloseEventSource(eventSource)
        }
    }, [eventSource])

    // CLEANUP: close eventsource on umount
    React.useEffect(() => {
        return () => {
            CloseEventSource(eventSourceRef.current)
        }
    }, [])

    return {
        eventSourceRef
    }
}

// Handle changes to queryParameters and return new query string when changed
// throttle can be used to control how frequently to update queryString in ms. Default = 50
export const useQueryString = (appendMode, queryParameters, throttle) => {
    const [queryString, setQueryString] = React.useState("")

    React.useEffect(() => {
        // const handler = setTimeout(() => {
        let newQueryString = ExtractQueryString(appendMode, ...queryParameters)
        if (newQueryString !== queryString) {
            setQueryString(newQueryString)
        }
        // }, throttle ? throttle : 50);

        // return () => {
        //     clearTimeout(handler);
        // };
    }, [appendMode, queryParameters, queryString, throttle])

    return {
        queryString
    }
}

export const genericEventSourceErrorHandler = (error, setError) => {
    if (error.status === 404) {
        setError(error.statusText)
    } else if (error.status === 403) {
        setError("permission denied")
    }
}