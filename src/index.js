import {useDirektivInstances} from './instances'
import {useDirektivJQPlayground} from './jqplayground'
import {useDirektivNamespaces} from './namespaces'
import {useDirektivNamespaceLogs} from './namespaces/logs'
import {useDirektivRegistries} from './registries'
import {useDirektivGlobalRegistries} from './registries/global'
import {useDirektivGlobalPrivateRegistries} from './registries/global-private'
import {useDirektivSecrets} from './secrets'
import {useDirektivNodes} from './nodes'
import { useDirektivWorkflow } from './workflow'
import {useDirektivWorkflowVariables} from './workflow/variables'
import {useDirektivBroadcastConfiguration} from './event-configuration'
import { useDirektivWorkflowLogs } from './workflow/logs'
import {useDirektivInstanceLogs, useDirektivInstance} from './instance'
import {useDirektivEvents} from './events'
import { useDirektivNamespaceMetrics } from './namespaces/metrics'
import { useDirektivNamespaceVariables } from './namespaces/variables'
import { useDirektivGlobalService, useDirektivGlobalServiceRevision, useDirektivGlobalServiceRevisionPodLogs, useDirektivGlobalServices} from './services/global'
import { useDirektivNamespaceServices } from './services/namespace'
import { useDirektivWorkflowServices } from './services/workflow'

export const useWorkflowServices = useDirektivWorkflowServices
export const useNamespaceServices = useDirektivNamespaceServices

export const useGlobalServices = useDirektivGlobalServices
export const useGlobalService = useDirektivGlobalService
export const useGlobalServiceRevision = useDirektivGlobalServiceRevision
export const useGlobalServiceRevisionPodLogs = useDirektivGlobalServiceRevisionPodLogs


export const useNamespaceVariables = useDirektivNamespaceVariables
export const useNamespaceMetrics = useDirektivNamespaceMetrics
export const useEvents = useDirektivEvents
export const useInstanceLogs = useDirektivInstanceLogs
export const useInstance = useDirektivInstance
export const useWorkflowLogs = useDirektivWorkflowLogs
export const useBroadcastConfiguration = useDirektivBroadcastConfiguration
export const useWorkflowVariables = useDirektivWorkflowVariables
export const useWorkflow = useDirektivWorkflow
export const useNodes = useDirektivNodes
export const useInstances = useDirektivInstances
export const useJQPlayground = useDirektivJQPlayground
export const useNamespaces = useDirektivNamespaces
export const useRegistries = useDirektivRegistries
export const useGlobalRegistries = useDirektivGlobalRegistries
export const useGlobalPrivateRegistries = useDirektivGlobalPrivateRegistries
export const useNamespaceLogs = useDirektivNamespaceLogs
export const useSecrets = useDirektivSecrets
