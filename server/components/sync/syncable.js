'use strict'

/**
 * Generic interface for syncable documents
 */
class Syncable {
  /**
   * Returns a unique ID for this syncable
   */
  getId() {}

  /**
   * Gets a list of documents for this syncable.
   *
   * @param clientId the client ID to which to send the documents, or null if
   *      we _are_ the client and wish to send to a server.
   */
  *getSyncableDocuments(clientId) {}

  /**
   * Validates a syncable document.
   *
   * @return
   */
  *validateSyncableDocument(document, clientId) {}

  /**
   *
   * Writes/persists a (previously-validated) syncable document.
   */
  *writeSyncableDocument(document) {}

  /**
   * Returns whether this syncable matches the given deletion
   *
   * @param {Document} deletion
   *
   * @returns {boolean} matches
   */
  matchesDeletion(deletion) {}

  /**
   * Validates that the given Deletion object is legal from the give clientId.
   *
   * @param {Document} deletion
   * @param {string} clientId
   *
   * @returns {boolean} validate
   */
  *validateDeletion(deletion, clientId) {}

  /**
   * Proceeds to the the (previously-validated) Deletion
   *
   * @param {Document} deletion
   */
  *deleteSyncableDocument(deletion) {}
}

module.exports = Syncable
