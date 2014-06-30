require 'spec_helper'

describe User do
  before {@user = User.new :name => 'Testuser', :email => 'test@ya.ru'}
  
  subject {@user}
  
  it {should respond_to :name}
  it {should respond_to :email}
  it {should respond_to :password_digest}
  
  it {should be_valid}
  
  describe "when name is not present" do
    before {@user.name = ' '}
    it {should_not be_valid}
  end
  
  describe "when name is not present" do
    before {@user.email = ' '}
    it {should_not be_valid}
  end
  
  describe "when name is too long" do
    before {@user.name = "a" * 51}
    it {should_not be_valid}
  end
  
  describe "when email is not valid" do
    it "should be is invalid" do
      list = %w[asd@,se,r @rr.,ty se.dock@er]
      list.each do |val|
        @user.email = val
        expect(@user).not_to be_valid
      end
    end
  end
  
  describe "when email is valid" do
    it "should be valid" do
      list = %w[asd@we.ru lamzin80@mail.ru la.m_zin.a.n@gmail.com lamzin-andrey@yandex.ru AsSD@dT.COm]
      list.each do |val|
        @user.email = val
        expect(@user).to be_valid
      end
    end
  end
  
  describe "when email already taken" do
    before do
      clone = @user.dup
      clone.email = clone.email.upcase
      clone.save
    end
    it {should_not be_valid}
  end  
  
  
end
