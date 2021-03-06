# frozen_string_literal: true

# Base class for Hourglass records, with some utility methods
class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  def multi_group_by(hash, keys, last_key_unique = false, index = 0)
    if index >= keys.count || hash.nil?
      hash
    elsif index == keys.count - 1 && last_key_unique
      Hash[hash.map { |v| [(v[keys[index]] rescue v.__send__(keys[index])), v]}]
    else
      Hash[hash.group_by(&(keys[index])).map { |k, v| [k, multi_group_by(v, keys, last_key_unique, index + 1)]}]
    end
  end
end
