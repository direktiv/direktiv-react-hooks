import * as React from 'react'
import fetch from "cross-fetch"
import { CloseEventSource, HandleError, ExtractQueryString } from '../util'
const { EventSourcePolyfill } = require('event-source-polyfill')

/*
    usePodLogs
    - url
    - pod
    - apikey
*/
export const useDirektivPodLogs = (url, pod, apikey) => {
    const [data, setData] = React.useState(null)
    const [err, setErr] = React.useState(null)
    const [eventSource, setEventSource] = React.useState(null)

    React.useEffect(() => {
        if (eventSource === null) {
            // setup event listener 
            let listener = new EventSourcePolyfill(`${url}functions/logs/pod/${pod}`, {
                headers: apikey === undefined ? {} : { "apikey": apikey }
            })

            listener.onerror = (e) => {
                if (e.status === 404) {
                    setErr(e.statusText)
                } else if (e.status === 403) {
                    setErr("permission denied")
                }
            }

            async function readData(e) {
                if (e.data === "") {
                    return
                }
                let json = JSON.parse(e.data)
                setData(json)
            }

            listener.onmessage = e => readData(e)
            setEventSource(listener)
        }
    }, [])

    React.useEffect(() => {
        return () => CloseEventSource(eventSource)
    }, [eventSource])

    React.useEffect(() => {
        if (eventSource !== null) {
            // setup event listener 
            let listener = new EventSourcePolyfill(`${url}functions/logs/pod/${pod}`, {
                headers: apikey === undefined ? {} : { "apikey": apikey }
            })

            listener.onerror = (e) => {
                if (e.status === 404) {
                    setErr(e.statusText)
                } else if (e.status === 403) {
                    setErr("permission denied")
                }
            }

            async function readData(e) {
                if (e.data === "") {
                    return
                }
                let json = JSON.parse(e.data)
                setData(json)
            }

            listener.onmessage = e => readData(e)
            setEventSource(listener)
        }

    }, [pod])

    return {
        data,
        err
    }

}