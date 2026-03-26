use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheEntry {
    pub response: String,
    pub created_at: u64,
    pub ttl_secs: u64,
    pub prompt_hash: String,
    pub hit_count: u32,
}

pub struct UiCache {
    entries: Mutex<HashMap<String, CacheEntry>>,
    max_entries: usize,
}

impl UiCache {
    pub fn new(max_entries: usize) -> Self {
        Self {
            entries: Mutex::new(HashMap::new()),
            max_entries,
        }
    }

    /// Generate a cache key from endpoint + data shape + preferences
    pub fn cache_key(
        domain: &str,
        capability_id: &str,
        data_hash: &str,
        prefs_hash: &str,
    ) -> String {
        let mut hasher = Sha256::new();
        hasher.update(domain.as_bytes());
        hasher.update(b":");
        hasher.update(capability_id.as_bytes());
        hasher.update(b":");
        hasher.update(data_hash.as_bytes());
        hasher.update(b":");
        hasher.update(prefs_hash.as_bytes());
        hex::encode(hasher.finalize())
    }

    /// Hash arbitrary data for cache key components
    pub fn hash_data(data: &str) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data.as_bytes());
        hex::encode(hasher.finalize())[..16].to_string()
    }

    /// Look up a cached response
    pub fn get(&self, key: &str) -> Option<CacheEntry> {
        let mut entries = self.entries.lock().unwrap();
        if let Some(entry) = entries.get_mut(key) {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or(Duration::ZERO)
                .as_secs();

            // Check TTL
            if now - entry.created_at > entry.ttl_secs {
                entries.remove(key);
                return None;
            }

            entry.hit_count += 1;
            Some(entry.clone())
        } else {
            None
        }
    }

    /// Store a response in cache
    pub fn put(&self, key: String, response: String, ttl_secs: u64) {
        let mut entries = self.entries.lock().unwrap();

        // Evict oldest entries if at capacity
        if entries.len() >= self.max_entries {
            let oldest_key = entries
                .iter()
                .min_by_key(|(_, v)| v.created_at)
                .map(|(k, _)| k.clone());
            if let Some(k) = oldest_key {
                entries.remove(&k);
            }
        }

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or(Duration::ZERO)
            .as_secs();

        entries.insert(
            key.clone(),
            CacheEntry {
                response,
                created_at: now,
                ttl_secs,
                prompt_hash: key,
                hit_count: 0,
            },
        );
    }

    /// Get cache stats
    pub fn stats(&self) -> CacheStats {
        let entries = self.entries.lock().unwrap();
        let total_hits: u32 = entries.values().map(|e| e.hit_count).sum();
        CacheStats {
            entry_count: entries.len(),
            total_hits,
            max_entries: self.max_entries,
        }
    }

    /// Clear all cache entries
    pub fn clear(&self) {
        let mut entries = self.entries.lock().unwrap();
        entries.clear();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheStats {
    pub entry_count: usize,
    pub total_hits: u32,
    pub max_entries: usize,
}
