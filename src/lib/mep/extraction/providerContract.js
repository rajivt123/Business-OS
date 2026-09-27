/**
 * Provider-Neutral Extraction Contract
 * Phase 4A Contract
 *
 * Defines the abstract interface and registry for extraction providers.
 *
 * STRICT RULE:
 * Business and domain logic must NEVER contain:
 * if (provider === 'gemini') ... else if (provider === 'openai') ...
 *
 * All providers must adhere to this standard contract.
 */

import { validateRawExtractionEnvelope } from './extractionEnvelope.js';

/**
 * Abstract Base Class for Extraction Providers
 */
export class ExtractionProvider {
  /**
   * @param {string} name - Unique provider identifier
   * @param {Object} [metadata] - Provider metadata
   * @param {Array<string>} [metadata.supportedStrategies] - Supported strategies
   * @param {boolean} [metadata.requiresServerSideKeys] - Whether this provider requires server-side API keys
   */
  constructor(name, metadata = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('ExtractionProvider must be instantiated with a valid name string.');
    }
    this.name = name;
    this.metadata = metadata;
  }

  /**
   * Executes extraction on a source document.
   *
   * @param {Object} params
   * @param {Object} params.document - mep_document_examples record
   * @param {Object} params.extractionJob - mep_document_extractions record
   * @param {Object} params.source - Resolved source attachment metadata & download URL
   * @param {Object} [params.options] - Execution options (timeout, max_pages, etc.)
   * @returns {Promise<Object>} Standard extraction result
   */
  async extractDocument(/* { document, extractionJob, source, options } */) {
    throw new Error(`Method "extractDocument" must be implemented by ExtractionProvider subclass "${this.name}".`);
  }

  /**
   * Validates that an extraction result adheres to the contract
   */
  validateResult(result) {
    if (!result || typeof result !== 'object') {
      throw new Error(`Provider "${this.name}" returned an invalid or empty extraction result.`);
    }

    if (!result.raw_output) {
      throw new Error(`Provider "${this.name}" failed to return "raw_output".`);
    }

    const envelopeValidation = validateRawExtractionEnvelope(result.raw_output);
    if (!envelopeValidation.valid) {
      throw new Error(`Provider "${this.name}" returned an invalid raw_output envelope: ${envelopeValidation.error}`);
    }

    return true;
  }
}

/**
 * Extraction Provider Registry
 */
class ExtractionRegistry {
  constructor() {
    this.providers = new Map();
    this.defaultProviderName = null;
  }

  /**
   * Registers an ExtractionProvider instance
   */
  register(provider, isDefault = false) {
    if (!(provider instanceof ExtractionProvider)) {
      throw new Error('Registered provider must be an instance of ExtractionProvider.');
    }
    this.providers.set(provider.name, provider);
    if (isDefault || !this.defaultProviderName) {
      this.defaultProviderName = provider.name;
    }
    return this;
  }

  /**
   * Retrieves a provider by name
   */
  get(name) {
    if (!name) return this.getDefault();
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Extraction provider "${name}" is not registered. Available providers: ${Array.from(this.providers.keys()).join(', ') || 'none'}`);
    }
    return provider;
  }

  /**
   * Retrieves the default provider
   */
  getDefault() {
    if (!this.defaultProviderName || !this.providers.has(this.defaultProviderName)) {
      throw new Error('No default extraction provider is registered in ExtractionRegistry.');
    }
    return this.providers.get(this.defaultProviderName);
  }

  /**
   * Lists all registered provider names
   */
  list() {
    return Array.from(this.providers.keys());
  }

  /**
   * Checks if a provider is registered
   */
  has(name) {
    return this.providers.has(name);
  }

  /**
   * Clears all registered providers (useful for testing)
   */
  clear() {
    this.providers.clear();
    this.defaultProviderName = null;
  }
}

export const ExtractionProviderRegistry = new ExtractionRegistry();
