require 'spec_helper'

describe Admin::XamppVersion do
  before { @xampp_version = Admin::XamppVersion.new xampp_version: '1.3.3', apache_version: '2.0.0', php_version: '5.3.3', mysql_client_version: '1.2.5', mysql_server_version: '1.1.1' }
  
  subject {@xampp_version}
  
  it {should respond_to(:xampp_version)}
  it {should respond_to(:apache_version)}
  
  describe "when xampp_version format is invalid" do
    it "should be invalid" do
      list = %w[dfnasjf ..- -1.2..2 258.----]
      list.each do |val|
        puts val
        @xampp_version.xampp_version = val
        expect(@xampp_version).not_to be_valid
      end
    end
  end
  
  describe "when xampp_version format is valid" do
    it "should be valid" do
      list = %w[1.8.3 1.2.3-5 12.25.32-25 1.0.0]
      list.each do |val|
        @xampp_version.xampp_version = val
        expect(@xampp_version).to be_valid
      end
    end
  end
  
end
