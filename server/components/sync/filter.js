'use strict'

/**
 * A filter modifies behavior of database syncables.
 */
class Filter {
  /**
   *
   */
  filterQuery(query) {}

  /**
   *
   */
  *validateSyncableDocument(document) {}
}

module.exports = Filter
