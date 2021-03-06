/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { combineReducers, createStore } from 'redux';
import { TrustedApp } from '../../../../../common/endpoint/types';
import { RoutingAction } from '../../../../common/store/routing';

import {
  MANAGEMENT_DEFAULT_PAGE,
  MANAGEMENT_DEFAULT_PAGE_SIZE,
  MANAGEMENT_STORE_GLOBAL_NAMESPACE,
  MANAGEMENT_STORE_TRUSTED_APPS_NAMESPACE,
} from '../../../common/constants';

import {
  AsyncResourceState,
  FailedResourceState,
  LoadedResourceState,
  LoadingResourceState,
  PaginationInfo,
  StaleResourceState,
  TrustedAppsListData,
  TrustedAppsListPageState,
  UninitialisedResourceState,
} from '../state';

import { trustedAppsPageReducer } from '../store/reducer';
import { TrustedAppsListResourceStateChanged } from '../store/action';

const OS_LIST: Array<TrustedApp['os']> = ['windows', 'macos', 'linux'];

export const createSampleTrustedApp = (i: number): TrustedApp => {
  return {
    id: String(i),
    name: `trusted app ${i}`,
    description: `Trusted App ${i}`,
    created_at: '1 minute ago',
    created_by: 'someone',
    os: OS_LIST[i % 3],
    entries: [],
  };
};

export const createSampleTrustedApps = (paginationInfo: PaginationInfo): TrustedApp[] => {
  return [...new Array(paginationInfo.size).keys()].map(createSampleTrustedApp);
};

export const createTrustedAppsListData = (
  paginationInfo: PaginationInfo,
  totalItemsCount: number,
  timestamp: number
) => ({
  items: createSampleTrustedApps(paginationInfo),
  totalItemsCount,
  paginationInfo,
  timestamp,
});

export const createServerApiError = (message: string) => ({
  statusCode: 500,
  error: 'Internal Server Error',
  message,
});

export const createUninitialisedResourceState = (): UninitialisedResourceState => ({
  type: 'UninitialisedResourceState',
});

export const createListLoadedResourceState = (
  paginationInfo: PaginationInfo,
  totalItemsCount: number,
  timestamp: number
): LoadedResourceState<TrustedAppsListData> => ({
  type: 'LoadedResourceState',
  data: createTrustedAppsListData(paginationInfo, totalItemsCount, timestamp),
});

export const createListFailedResourceState = (
  message: string,
  lastLoadedState?: LoadedResourceState<TrustedAppsListData>
): FailedResourceState<TrustedAppsListData> => ({
  type: 'FailedResourceState',
  error: createServerApiError(message),
  lastLoadedState,
});

export const createListLoadingResourceState = (
  previousState: StaleResourceState<TrustedAppsListData> = createUninitialisedResourceState()
): LoadingResourceState<TrustedAppsListData> => ({
  type: 'LoadingResourceState',
  previousState,
});

export const createListComplexLoadingResourceState = (
  paginationInfo: PaginationInfo,
  totalItemsCount: number,
  timestamp: number
): LoadingResourceState<TrustedAppsListData> =>
  createListLoadingResourceState(
    createListFailedResourceState(
      'Internal Server Error',
      createListLoadedResourceState(paginationInfo, totalItemsCount, timestamp)
    )
  );

export const createDefaultPaginationInfo = () => ({
  index: MANAGEMENT_DEFAULT_PAGE,
  size: MANAGEMENT_DEFAULT_PAGE_SIZE,
});

export const createLoadedListViewWithPagination = (
  freshDataTimestamp: number,
  paginationInfo: PaginationInfo = createDefaultPaginationInfo(),
  totalItemsCount: number = 200
): TrustedAppsListPageState['listView'] => ({
  listResourceState: createListLoadedResourceState(
    paginationInfo,
    totalItemsCount,
    freshDataTimestamp
  ),
  freshDataTimestamp,
});

export const createUserChangedUrlAction = (path: string, search: string = ''): RoutingAction => {
  return { type: 'userChangedUrl', payload: { pathname: path, search, hash: '' } };
};

export const createTrustedAppsListResourceStateChangedAction = (
  newState: AsyncResourceState<TrustedAppsListData>
): TrustedAppsListResourceStateChanged => ({
  type: 'trustedAppsListResourceStateChanged',
  payload: { newState },
});

export const createGlobalNoMiddlewareStore = () => {
  return createStore(
    combineReducers({
      [MANAGEMENT_STORE_GLOBAL_NAMESPACE]: combineReducers({
        [MANAGEMENT_STORE_TRUSTED_APPS_NAMESPACE]: trustedAppsPageReducer,
      }),
    })
  );
};
