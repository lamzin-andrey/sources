require 'spec_helper'
describe Admin::ArchiveLink do
  before { @archive_link = Admin::ArchiveLink.new bits: 64, link_full: 'http://abc.de', link_light: 'http://fg.hi' }
  
  subject {@archive_link}
  
  it {should respond_to(:bits)}
  it {should respond_to(:link_full)}
  it {should respond_to(:link_light)}
  
  describe "when bits format is invalid" do
    it "should be invalid" do
      list = %w[dsds a25 2d5 0 01]
      list.each do |val|
        @archive_link.bits = val
        expect(@archive_link).not_to be_valid
      end
    end
  end
  
  describe "when bits format is valid" do
    it "should be valid" do
      list = %w[32 644 128]
      list.each do |val|
        @archive_link.bits = val
        expect(@archive_link).to be_valid
      end
    end
  end
  
end
