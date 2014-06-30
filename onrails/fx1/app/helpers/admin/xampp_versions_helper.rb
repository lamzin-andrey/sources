module Admin::XamppVersionsHelper
  def prepareErrors(errList)
    s = ''
    keys = []
    @errors.each do |k, v|
	  ctrl = keys.find {|n| n == k}
	  if ctrl == nil
	    s += t(:Field) + ' ' +  t(k) + ' ' + v + "\n"
	    keys.push k
	  end
    end
    return s
  end
end
